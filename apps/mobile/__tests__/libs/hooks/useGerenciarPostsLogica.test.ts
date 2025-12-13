import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useGerenciarPostsLogic } from "@/libs/hooks/useGerenciarPostsLogica";
import { useMyPosts } from "@/libs/hooks/useMyPosts";
import { getComments } from "@/libs/auth/handleComments";
import { api_route } from "@/libs/auth/api";
import { useRouter } from "expo-router";

// --- MOCKS ---
jest.mock("@/libs/hooks/useMyPosts", () => ({
  useMyPosts: jest.fn(),
}));

jest.mock("@/libs/auth/handleComments", () => ({
  getComments: jest.fn(),
}));

jest.mock("@/libs/auth/api", () => ({
  api_route: {
    delete: jest.fn(),
  },
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

describe("useGerenciarPostsLogic", () => {
  const mockRouterPush = jest.fn();
  const mockHandleDeletePost = jest.fn();
  const mockOnRefresh = jest.fn();
  const mockMyPosts = [{ id: "1", title: "Post 1", type: "GENERAL" }];

  const mockGetComments = getComments as jest.Mock;
  const mockApiDelete = api_route.delete as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    (useMyPosts as jest.Mock).mockReturnValue({
      myPosts: mockMyPosts,
      isLoading: false,
      isRefreshing: false,
      onRefresh: mockOnRefresh,
      handleDeletePost: mockHandleDeletePost,
    });
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("deve inicializar com os estados padrao", () => {
    const { result } = renderHook(() => useGerenciarPostsLogic());

    expect(result.current.myPosts).toEqual(mockMyPosts);
    expect(result.current.selectedPost).toBeNull();
    expect(result.current.menuVisible).toBe(false);
    expect(result.current.commentsModalVisible).toBe(false);
    expect(result.current.postComments).toEqual([]);
    expect(result.current.alertConfig.visible).toBe(false);
  });

  it("deve abrir o menu de acoes e selecionar o post", () => {
    const { result } = renderHook(() => useGerenciarPostsLogic());
    const post = { id: "1", title: "Post 1", type: "GENERAL" } as any;

    act(() => {
      result.current.openActionMenu(post);
    });

    expect(result.current.selectedPost).toEqual(post);
    expect(result.current.menuVisible).toBe(true);
  });

  it("deve fechar o alerta corretamente", async () => {
    const { result } = renderHook(() => useGerenciarPostsLogic());
    const post = { id: "1", type: "GENERAL" } as any;

    act(() => {
      result.current.openActionMenu(post);
    });

    // Aguarda estado atualizar
    await waitFor(() => {
      expect(result.current.selectedPost).toEqual(post);
    });

    act(() => {
      result.current.confirmDeletePost();
    });
    
    expect(result.current.alertConfig.visible).toBe(true);

    act(() => {
      result.current.closeAlert();
    });
    expect(result.current.alertConfig.visible).toBe(false);
  });

  it("deve navegar para editar post (GENERAL) e fechar o menu", async () => {
    const { result } = renderHook(() => useGerenciarPostsLogic());
    const post = { id: "123", title: "Edit Post", type: "GENERAL" } as any;

    act(() => {
      result.current.openActionMenu(post);
    });

    await waitFor(() => {
      expect(result.current.selectedPost).toEqual(post);
    });

    act(() => {
      // Passamos o post explicitamente para garantir
      result.current.handleEditPost(post);
    });

    expect(result.current.menuVisible).toBe(false);
    expect(mockRouterPush).toHaveBeenCalledWith({
      pathname: "/(DashBoard)/(tabs)/(edit)/editarPost",
      params: { postData: JSON.stringify(post) },
    });
  });

  it("deve navegar para editar evento (EVENT) e fechar o menu", async () => {
    const { result } = renderHook(() => useGerenciarPostsLogic());
    const post = { id: "124", title: "Edit Event", type: "EVENT" } as any;

    act(() => {
      result.current.openActionMenu(post);
    });

    await waitFor(() => {
      expect(result.current.selectedPost).toEqual(post);
    });

    act(() => {
      result.current.handleEditPost(post);
    });

    expect(mockRouterPush).toHaveBeenCalledWith({
      pathname: "/(DashBoard)/(tabs)/(edit)/editEvento",
      params: { postData: JSON.stringify(post) },
    });
  });

  it("deve abrir alerta de confirmacao ao tentar deletar post", async () => {
    const { result } = renderHook(() => useGerenciarPostsLogic());
    const post = { id: "1", type: "GENERAL" } as any;

    act(() => {
      result.current.openActionMenu(post);
    });

    await waitFor(() => {
      expect(result.current.selectedPost).toEqual(post);
    });

    act(() => {
      result.current.confirmDeletePost();
    });

    expect(result.current.alertConfig.visible).toBe(true);
    // Título corrigido para "Deletar Post" conforme erro anterior
    expect(result.current.alertConfig.title).toBe("Deletar Post");
  });

  it("deve executar a delecao do post ao confirmar no alerta", async () => {
    const { result } = renderHook(() => useGerenciarPostsLogic());
    const post = { id: "100", type: "GENERAL" } as any;

    act(() => {
      result.current.openActionMenu(post);
    });

    // CRUCIAL: Aguardar o estado selectedPost ser atualizado
    await waitFor(() => {
        expect(result.current.selectedPost).toEqual(post);
    });

    act(() => {
      result.current.confirmDeletePost();
    });

    await act(async () => {
      if (result.current.alertConfig.onConfirm) {
        result.current.alertConfig.onConfirm();
      }
    });

    expect(result.current.menuVisible).toBe(false);
    expect(result.current.alertConfig.visible).toBe(false);
  });

  it("deve carregar comentarios e filtrar pelo post selecionado", async () => {
    const { result } = renderHook(() => useGerenciarPostsLogic());
    const post = { id: "p1", type: "GENERAL" } as any;
    const commentsData = [
      { id: "c1", postId: "p1", content: "Comment 1" },
      { id: "c2", postId: "p2", content: "Comment 2" },
    ];

    mockGetComments.mockResolvedValue(commentsData);

    await act(async () => {
      await result.current.handleOpenManageComments(post);
    });

    expect(result.current.selectedPost).toEqual(post);
    expect(result.current.commentsModalVisible).toBe(true);
    expect(result.current.loadingComments).toBe(false);
    expect(result.current.postComments).toHaveLength(1);
    expect(result.current.postComments[0].id).toBe("c1");
  });

  it("deve lidar com erro ao carregar comentarios", async () => {
    const { result } = renderHook(() => useGerenciarPostsLogic());
    const post = { id: "p1", type: "GENERAL" } as any;

    mockGetComments.mockRejectedValue(new Error("Erro API"));

    await act(async () => {
      await result.current.handleOpenManageComments(post);
    });

    expect(result.current.loadingComments).toBe(false);
    expect(result.current.alertConfig.visible).toBe(true);
    expect(result.current.alertConfig.title).toBe("Erro");
  });

  it("deve lidar com retorno invalido de comentarios", async () => {
    const { result } = renderHook(() => useGerenciarPostsLogic());
    const post = { id: "p1", type: "GENERAL" } as any;

    mockGetComments.mockResolvedValue(null);

    await act(async () => {
      await result.current.handleOpenManageComments(post);
    });

    expect(result.current.postComments).toEqual([]);
  });

  it("deve deletar comentario com sucesso", async () => {
    const { result } = renderHook(() => useGerenciarPostsLogic());
    const post = { id: "p1", type: "GENERAL" } as any;
    const commentId = "c1";

    mockGetComments.mockResolvedValue([{ id: "c1", postId: "p1" }]);
    mockApiDelete.mockResolvedValue({});

    await act(async () => {
      await result.current.handleOpenManageComments(post);
    });

    await waitFor(() => expect(result.current.selectedPost).toEqual(post));

    act(() => {
      result.current.handleDeleteComment(commentId);
    });

    expect(result.current.alertConfig.visible).toBe(true);
    expect(result.current.alertConfig.title).toBe("Deletar Comentário");

    await act(async () => {
      if (result.current.alertConfig.onConfirm) {
        await result.current.alertConfig.onConfirm();
      }
    });

    expect(api_route.delete).toHaveBeenCalledWith("/posts/p1/comments/c1");
    expect(result.current.postComments).toEqual([]);
  });

  it("deve lidar com erro ao deletar comentario", async () => {
    const { result } = renderHook(() => useGerenciarPostsLogic());
    const post = { id: "p1", type: "GENERAL" } as any;
    const commentId = "c1";

    mockGetComments.mockResolvedValue([{ id: "c1", postId: "p1" }]);
    mockApiDelete.mockRejectedValue(new Error("Erro Delete"));

    await act(async () => {
      await result.current.handleOpenManageComments(post);
    });

    await waitFor(() => expect(result.current.selectedPost).toEqual(post));

    act(() => {
      result.current.handleDeleteComment(commentId);
    });

    await act(async () => {
      if (result.current.alertConfig.onConfirm) {
        await result.current.alertConfig.onConfirm();
      }
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(result.current.alertConfig.visible).toBe(true);
    expect(result.current.alertConfig.title).toBe("Erro");
    expect(result.current.alertConfig.message).toBe("Não foi possível deletar o comentário.");
  });

  it("nao deve deletar comentario se nao houver post selecionado", async () => {
    const { result } = renderHook(() => useGerenciarPostsLogic());

    act(() => {
      result.current.handleDeleteComment("c1");
    });

    expect(result.current.alertConfig.visible).toBe(false);
  });

  it("deve permitir controle manual de setMenuVisible", () => {
    const { result } = renderHook(() => useGerenciarPostsLogic());

    act(() => {
        result.current.setMenuVisible(true);
    });
    expect(result.current.menuVisible).toBe(true);
  });

  it("deve permitir controle manual de setCommentsModalVisible", () => {
    const { result } = renderHook(() => useGerenciarPostsLogic());

    act(() => {
        result.current.setCommentsModalVisible(true);
    });
    expect(result.current.commentsModalVisible).toBe(true);
  });
});