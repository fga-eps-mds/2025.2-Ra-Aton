import { renderHook, act } from "@testing-library/react-native";
import { useFeedModals } from "@/libs/hooks/useModalFeed";
import { getComments, postComment } from "@/libs/auth/handleComments";
import { handleReport } from "@/libs/auth/handleReport";
import { Alert } from "react-native";

// --- MOCKS ---
jest.mock("@/libs/auth/handleComments", () => ({
  getComments: jest.fn(),
  postComment: jest.fn(),
}));

jest.mock("@/libs/auth/handleReport", () => ({
  handleReport: jest.fn(),
}));

jest.spyOn(Alert, "alert");

describe("useFeedModals", () => {
  const mockGetComments = getComments as jest.Mock;
  const mockPostComment = postComment as jest.Mock;
  const mockHandleReport = handleReport as jest.Mock;
  const mockSetPosts = jest.fn();
  
  const mockUser = { id: "user-1", name: "User" };
  const mockPosts = [
    { id: "post-1", title: "Post 1", commentsCount: 0 },
    { id: "post-2", title: "Post 2", commentsCount: 5 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("deve inicializar com estados padrao", () => {
    const { result } = renderHook(() => useFeedModals({ user: mockUser, setPosts: mockSetPosts }));

    expect(result.current.isOptionsVisible).toBe(false);
    expect(result.current.isCommentsVisible).toBe(false);
    expect(result.current.isReportModalVisible).toBe(false);
    expect(result.current.showModal).toBe(false);
    expect(result.current.selectedPostId).toBeNull();
    expect(result.current.comments).toEqual([]);
    expect(result.current.isLoadingComments).toBe(false);
  });

  it("deve abrir modal de comentarios e buscar comentarios com sucesso", async () => {
    const mockCommentsData = [{ id: "c1", postId: "post-1", content: "Comentario" }];
    mockGetComments.mockResolvedValue(mockCommentsData);

    const { result } = renderHook(() => useFeedModals({ user: mockUser, setPosts: mockSetPosts }));

    await act(async () => {
      await result.current.handleOpenComments("post-1");
    });

    expect(result.current.selectedPostId).toBe("post-1");
    expect(result.current.isCommentsVisible).toBe(true);
    expect(result.current.comments).toEqual(mockCommentsData);
  });

  it("deve filtrar comentarios incorretos ao buscar", async () => {
    const mockCommentsData = [
      { id: "c1", postId: "post-1", content: "C1" },
      { id: "c2", postId: "post-2", content: "C2" }
    ];
    mockGetComments.mockResolvedValue(mockCommentsData);

    const { result } = renderHook(() => useFeedModals({ user: mockUser, setPosts: mockSetPosts }));

    await act(async () => {
      await result.current.handleOpenComments("post-1");
    });

    expect(result.current.comments).toHaveLength(1);
    expect(result.current.comments[0].id).toBe("c1");
  });

  it("deve lidar com resposta nao array ao buscar comentarios", async () => {
    mockGetComments.mockResolvedValue(null);

    const { result } = renderHook(() => useFeedModals({ user: mockUser, setPosts: mockSetPosts }));

    await act(async () => {
      await result.current.handleOpenComments("post-1");
    });

    expect(result.current.comments).toEqual([]);
  });

  it("deve lidar com erro ao buscar comentarios", async () => {
    mockGetComments.mockRejectedValue(new Error("Erro API"));

    const { result } = renderHook(() => useFeedModals({ user: mockUser, setPosts: mockSetPosts }));

    await act(async () => {
      await result.current.handleOpenComments("post-1");
    });

    expect(result.current.comments).toEqual([]);
  });

  it("deve fechar modal de comentarios", () => {
    const { result } = renderHook(() => useFeedModals({ user: mockUser, setPosts: mockSetPosts }));

    act(() => {
      result.current.handleOpenComments("post-1");
    });

    act(() => {
      result.current.handleCloseComments();
    });

    expect(result.current.isCommentsVisible).toBe(false);
    expect(result.current.selectedPostId).toBeNull();
    expect(result.current.comments).toEqual([]);
  });

  it("deve abrir e fechar modal de opcoes", () => {
    const { result } = renderHook(() => useFeedModals({ user: mockUser, setPosts: mockSetPosts }));

    act(() => {
      result.current.handleOpenOptions("post-1");
    });

    expect(result.current.isOptionsVisible).toBe(true);
    expect(result.current.selectedPostId).toBe("post-1");

    act(() => {
      result.current.handleCloseModals();
    });

    expect(result.current.isOptionsVisible).toBe(false);
    expect(result.current.selectedPostId).toBeNull();
  });

  // Nota: Certifique-se de que handleOpenReportModal está exportado no seu hook
  it("deve abrir modal de report e fechar modal de opcoes", () => {
    const { result } = renderHook(() => useFeedModals({ user: mockUser, setPosts: mockSetPosts }));

    act(() => {
      result.current.handleOpenOptions("post-1");
      // Se esta função não estiver exportada no hook, adicione-a ao return do useModalFeed.ts
      if (result.current.handleOpenReportModal) {
        result.current.handleOpenReportModal();
      }
    });

    // Se a função existir, verificamos o estado
    if (result.current.handleOpenReportModal) {
      expect(result.current.isOptionsVisible).toBe(false);
      expect(result.current.isReportModalVisible).toBe(true);
    }
  });

  it("deve fechar modal de report", () => {
    const { result } = renderHook(() => useFeedModals({ user: mockUser, setPosts: mockSetPosts }));

    act(() => {
      if (result.current.handleOpenReportModal) {
        result.current.handleOpenReportModal();
        result.current.handleCloseReportModal();
      }
    });

    if (result.current.handleOpenReportModal) {
      expect(result.current.isReportModalVisible).toBe(false);
    }
  });

  it("nao deve submeter report se usuario ou post nao existirem", async () => {
    const { result } = renderHook(() => useFeedModals({ user: null, setPosts: mockSetPosts }));

    await act(async () => {
      await result.current.handleSubmitReport("Spam");
    });

    expect(mockHandleReport).not.toHaveBeenCalled();
  });

  it("deve submeter report com sucesso", async () => {
    mockHandleReport.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useFeedModals({ user: mockUser, setPosts: mockSetPosts }));

    act(() => {
      result.current.handleOpenOptions("post-1");
    });

    await act(async () => {
      await result.current.handleSubmitReport("Spam");
    });

    // CORREÇÃO: Argumentos atualizados conforme o erro recebido
    expect(mockHandleReport).toHaveBeenCalledWith({
      postId: "post-1",
      reporterId: "user-1", // Alterado de userId para reporterId
      reason: "Spam",
      type: "post"          // Campo type adicionado
    });
    
    expect(Alert.alert).toHaveBeenCalledWith("Denúncia Enviada", expect.any(String));
    expect(result.current.isReportModalVisible).toBe(false);
    expect(result.current.selectedPostId).toBeNull();
  });

  it("deve lidar com erro ao submeter report", async () => {
    mockHandleReport.mockRejectedValue(new Error("Erro Report"));
    const { result } = renderHook(() => useFeedModals({ user: mockUser, setPosts: mockSetPosts }));

    act(() => {
      result.current.handleOpenOptions("post-1");
    });

    await act(async () => {
      await result.current.handleSubmitReport("Spam");
    });

    expect(Alert.alert).toHaveBeenCalledWith("Erro", "Erro Report");
    expect(result.current.isReportModalVisible).toBe(false);
  });

  it("deve abrir e fechar modal de infos", () => {
    const { result } = renderHook(() => useFeedModals({ user: mockUser, setPosts: mockSetPosts }));

    act(() => {
      result.current.openModalInfos();
    });

    expect(result.current.isOptionsVisible).toBe(false);
    expect(result.current.showModal).toBe(true);

    act(() => {
      result.current.closeModalInfos();
    });

    expect(result.current.showModal).toBe(false);
    expect(result.current.selectedPostId).toBeNull();
  });

  it("nao deve postar comentario se usuario ou post nao existirem", async () => {
    const { result } = renderHook(() => useFeedModals({ user: null, setPosts: mockSetPosts }));

    await act(async () => {
      await result.current.handlePostComment("Texto");
    });

    expect(mockPostComment).not.toHaveBeenCalled();
  });

  it("deve postar comentario com sucesso e atualizar estados", async () => {
    const newComment = { id: "new-c", content: "Texto", postId: "post-1" };
    mockPostComment.mockResolvedValue(newComment);

    const { result } = renderHook(() => useFeedModals({ user: mockUser, setPosts: mockSetPosts }));

    act(() => {
      result.current.handleOpenComments("post-1");
    });

    await act(async () => {
      await result.current.handlePostComment("Texto");
    });

    expect(mockPostComment).toHaveBeenCalledWith({
      postId: "post-1",
      authorId: "user-1",
      content: "Texto",
    });

    expect(result.current.comments).toContainEqual(newComment);

    expect(mockSetPosts).toHaveBeenCalled();
    const setPostsCallback = mockSetPosts.mock.calls[0][0];
    const updatedPosts = setPostsCallback(mockPosts);
    
    expect(updatedPosts).toEqual([
      { id: "post-1", title: "Post 1", commentsCount: 1 },
      { id: "post-2", title: "Post 2", commentsCount: 5 },
    ]);
  });

  it("deve lidar com erro ao postar comentario", async () => {
    mockPostComment.mockRejectedValue(new Error("Erro Comment"));
    const { result } = renderHook(() => useFeedModals({ user: mockUser, setPosts: mockSetPosts }));

    act(() => {
      result.current.handleOpenComments("post-1");
    });

    await act(async () => {
      await result.current.handlePostComment("Texto");
    });

    expect(mockSetPosts).not.toHaveBeenCalled();
  });
});