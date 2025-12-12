import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useFeedEvents } from "@/libs/hooks/useFeedEvents";
import { getFeed } from "@/libs/auth/handleFeed";

jest.mock("@/libs/auth/handleFeed", () => ({
  getFeed: jest.fn(),
}));

let focusCallback: (() => void | (() => void)) | null = null;

jest.mock("expo-router", () => ({
  useFocusEffect: jest.fn((callback) => {
    focusCallback = callback;
  }),
}));

describe("useFeedEvents", () => {
  const mockGetFeed = getFeed as jest.Mock;
  const mockPosts = [
    { id: "1", title: "Post 1" },
    { id: "2", title: "Post 2" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    focusCallback = null;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("deve carregar a primeira pagina ao ganhar foco", async () => {
    mockGetFeed.mockResolvedValue({
      data: mockPosts,
      meta: { hasNextPage: true },
    });

    const { result } = renderHook(() => useFeedEvents());

    expect(focusCallback).toBeTruthy();

    await act(async () => {
      if (focusCallback) focusCallback();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.posts).toEqual(mockPosts);
    expect(mockGetFeed).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 })
    );
  });

  it("deve abortar a requisicao ao desmontar ou perder foco", async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, "abort");
    mockGetFeed.mockResolvedValue({ data: [] });

    const { result, unmount } = renderHook(() => useFeedEvents());

    let cleanup: (() => void) | void;
    await act(async () => {
      if (focusCallback) cleanup = focusCallback();
    });

    unmount();
    
    if (typeof cleanup === "function") cleanup();
    
    expect(abortSpy).toHaveBeenCalled();
  });

  it("deve carregar a proxima pagina em onEndReached", async () => {
    mockGetFeed.mockResolvedValueOnce({
      data: mockPosts,
      meta: { hasNextPage: true },
    });

    const { result } = renderHook(() => useFeedEvents());

    await act(async () => {
      if (focusCallback) focusCallback();
    });

    const newPosts = [{ id: "3", title: "Post 3" }];
    mockGetFeed.mockResolvedValueOnce({
      data: newPosts,
      meta: { hasNextPage: false },
    });

    await act(async () => {
      await result.current.onEndReached();
    });

    expect(mockGetFeed).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 })
    );
    expect(result.current.posts).toHaveLength(3);
    expect(result.current.hasNextPage).toBe(false);
  });

  it("nao deve carregar proxima pagina se posts estiver vazio", async () => {
    const { result } = renderHook(() => useFeedEvents());

    await act(async () => {
      await result.current.onEndReached();
    });

    expect(mockGetFeed).not.toHaveBeenCalled();
  });

  it("nao deve carregar proxima pagina se ja estiver carregando", async () => {
    mockGetFeed.mockReturnValue(new Promise(() => {})); 

    const { result } = renderHook(() => useFeedEvents());

    await act(async () => {
      if (focusCallback) focusCallback();
    });

    await act(async () => {
      await result.current.onEndReached();
    });

    expect(mockGetFeed).toHaveBeenCalledTimes(1); 
  });

  it("nao deve carregar proxima pagina se hasNextPage for false", async () => {
    mockGetFeed.mockResolvedValue({
      data: mockPosts,
      meta: { hasNextPage: false },
    });

    const { result } = renderHook(() => useFeedEvents());

    await act(async () => {
      if (focusCallback) focusCallback();
    });

    await act(async () => {
      await result.current.onEndReached();
    });

    expect(mockGetFeed).toHaveBeenCalledTimes(1);
  });

  it("deve respeitar o throttle em onEndReached", async () => {
    mockGetFeed.mockResolvedValue({
      data: mockPosts,
      meta: { hasNextPage: true },
    });

    const { result } = renderHook(() => useFeedEvents());

    await act(async () => {
      if (focusCallback) focusCallback();
    });

    const dateSpy = jest.spyOn(Date, "now");
    dateSpy.mockReturnValue(1000);

    await act(async () => {
      await result.current.onEndReached();
    });

    dateSpy.mockReturnValue(1500); 

    await act(async () => {
      await result.current.onEndReached();
    });

    expect(mockGetFeed).toHaveBeenCalledTimes(2); 
  });

  it("deve recarregar ao chamar onRefresh", async () => {
    mockGetFeed.mockResolvedValue({
      data: mockPosts,
      meta: { hasNextPage: true },
    });

    const { result } = renderHook(() => useFeedEvents());

    await act(async () => {
      await result.current.onRefresh();
    });

    expect(result.current.isRefreshing).toBe(false);
    expect(mockGetFeed).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1 })
    );
  });

  it("deve recarregar ao chamar reloadFeed", async () => {
    mockGetFeed.mockResolvedValue({ data: [] });
    const { result } = renderHook(() => useFeedEvents());

    await act(async () => {
      await result.current.reloadFeed();
    });

    expect(mockGetFeed).toHaveBeenCalled();
  });

  it("deve lidar com erro de cancelamento sem atualizar estado incorretamente", async () => {
    const canceledError = { name: "CanceledError" };
    mockGetFeed.mockRejectedValue(canceledError);

    const { result } = renderHook(() => useFeedEvents());

    await act(async () => {
      if (focusCallback) focusCallback();
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("deve lidar com erro generico", async () => {
    mockGetFeed.mockRejectedValue(new Error("Erro generico"));

    const { result } = renderHook(() => useFeedEvents());

    await act(async () => {
      if (focusCallback) focusCallback();
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("deve calcular hasNextPage baseado no tamanho do array se meta nao existir", async () => {
    const limitPosts = Array(10).fill({ id: "x", title: "x" });
    mockGetFeed.mockResolvedValue({
      data: limitPosts,
    });

    const { result } = renderHook(() => useFeedEvents());

    await act(async () => {
      if (focusCallback) focusCallback();
    });

    expect(result.current.hasNextPage).toBe(true);
  });

  it("deve calcular hasNextPage como false se array menor que limit e meta nao existir", async () => {
    const fewPosts = [{ id: "1", title: "1" }];
    mockGetFeed.mockResolvedValue({
      data: fewPosts,
    });

    const { result } = renderHook(() => useFeedEvents());

    await act(async () => {
      if (focusCallback) focusCallback();
    });

    expect(result.current.hasNextPage).toBe(false);
  });

  it("deve lidar com resposta vazia ou invalida", async () => {
    mockGetFeed.mockResolvedValue(null);

    const { result } = renderHook(() => useFeedEvents());

    await act(async () => {
      if (focusCallback) focusCallback();
    });

    expect(result.current.posts).toEqual([]);
  });

  it("deve impedir requests simultaneos via isLoadingRef", async () => {
    mockGetFeed.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 500)));

    const { result } = renderHook(() => useFeedEvents());

    act(() => {
      if (focusCallback) focusCallback();
    });
    
    await act(async () => {
      await result.current.reloadFeed();
    });

    expect(mockGetFeed).toHaveBeenCalledTimes(1);
    
    await act(async () => {
        jest.runAllTimers();
    });
  });
});