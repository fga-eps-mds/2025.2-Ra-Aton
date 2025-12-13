import { renderHook, act, waitFor } from "@testing-library/react-native";
import { Alert, Platform } from "react-native";
import {
  getMatchesFeed,
  subscribeToMatch,
  getMatchById,
  switchTeam as switchTeamRequest,
  unsubscribeFromMatch,
} from "@/libs/auth/handleMatch";
import { useUser } from "@/libs/storage/UserContext";
import { useFeedMatches } from "@/libs/hooks/useMatchesFunctions";

// --- MOCKS ---

jest.mock("@/libs/storage/UserContext", () => ({
  useUser: jest.fn(() => ({ user: { id: "user-123" } })),
}));

jest.mock("@/libs/auth/handleMatch", () => ({
  getMatchesFeed: jest.fn(),
  subscribeToMatch: jest.fn(),
  unsubscribeFromMatch: jest.fn(),
  getMatchById: jest.fn(),
  switchTeam: jest.fn(),
}));

jest.mock("react-native", () => ({
  ...jest.requireActual("react-native"),
  Alert: { alert: jest.fn() },
  Platform: { OS: "ios", select: jest.fn((objs) => objs["ios"]) },
}));

jest.mock("axios", () => ({
  ...jest.requireActual("axios"),
  isAxiosError: jest.fn((error) => !!error.response),
}));

const createAxiosError = (status: number, message: string) => ({
  response: { status, data: { message } },
  isAxiosError: true,
});

// --- DADOS MOCK ---
const mockMatchA = {
  id: "match-A",
  teamA: { players: [] },
  teamB: { players: [] },
} as any;
const mockMatchB = {
  id: "match-B",
  teamA: { players: [{ id: "user-123" }] },
  teamB: { players: [] },
} as any;

describe("Hook: useFeedMatches (100% Coverage)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as any).OS = "ios";

    // Sucesso padrão
    (getMatchesFeed as jest.Mock).mockResolvedValue({
      data: [mockMatchA],
      meta: { page: 1, limit: 10, hasNextPage: true },
    });
    (getMatchById as jest.Mock).mockResolvedValue(mockMatchA);
    (subscribeToMatch as jest.Mock).mockResolvedValue(true);
    (unsubscribeFromMatch as jest.Mock).mockResolvedValue(true);
    (switchTeamRequest as jest.Mock).mockResolvedValue(true);
  });

  // --- 1. CARREGAMENTO, INICIALIZAÇÃO E CLEANUP ---

  it("deve carregar dados iniciais com sucesso", async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.matches).toHaveLength(1);
  });

  it("deve lidar com reloadFeed manual", async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.reloadFeed();
    });

    expect(getMatchesFeed).toHaveBeenCalledTimes(2); // Inicial + Reload
  });

  it("deve limpar requisição pendente ao desmontar (AbortController)", async () => {
    const { unmount } = renderHook(() => useFeedMatches());
    unmount();
  });

  // --- 2. PAGINAÇÃO, THROTTLE E FALLBACKS ---

  it("deve carregar próxima página ao atingir o fim", async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    (getMatchesFeed as jest.Mock).mockResolvedValueOnce({
      data: [{ id: "match-page-2" }],
      meta: { page: 2, limit: 10, hasNextPage: false },
    });

    await act(async () => {
      result.current.onEndReached();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.matches).toHaveLength(2);
  });

  it("deve bloquear onEndReached se lista vazia ou loading ou sem next page", async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.onRefresh(); // Ativa loading
      result.current.onEndReached(); // Ignorado
    });
    expect(getMatchesFeed).toHaveBeenCalledTimes(2); // 1 inicial + 1 refresh

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("deve respeitar throttle no onEndReached", async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.onEndReached();
    });
    act(() => {
      result.current.onEndReached();
    }); // Ignorado pelo throttle

    expect(getMatchesFeed).toHaveBeenCalledTimes(2);
  });

  it("deve usar fallback de paginação quando meta.page ou data faltam", async () => {
    // Simula resposta sem meta.page e sem hasNextPage explícito
    (getMatchesFeed as jest.Mock).mockResolvedValue({
      data: Array(10).fill(mockMatchA), // 10 itens -> next page implícita
      meta: { limit: 10 }, // page e hasNextPage undefined
    });

    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Deve ter assumido targetPage (1) e hasNextPage true (limit atingido)
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.matches.length).toBe(10);
  });

  it("deve tratar resposta com data null (não array)", async () => {
    (getMatchesFeed as jest.Mock).mockResolvedValue({
      data: null,
      meta: { page: 1, limit: 10, hasNextPage: false },
    });

    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.matches).toEqual([]);
  });

  it("deve forçar hasNextPage false se data vazio e página > 1", async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Carrega página 2 vazia
    (getMatchesFeed as jest.Mock).mockResolvedValue({
      data: [],
      meta: { page: 2, limit: 10, hasNextPage: true }, // Backend diz true mas tá vazio
    });

    await act(async () => {
      result.current.onEndReached();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasNextPage).toBe(false);
  });

  // --- 3. JOIN MATCH (INSCRIÇÃO) ---

  it("deve entrar na partida com sucesso (Mobile)", async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const mockOpenModal = jest.fn();

    act(() => {
      result.current.joinMatch(mockMatchA, mockOpenModal);
    });

    const confirmBtn = (Alert.alert as jest.Mock).mock.calls[0][2][1];
    await act(async () => confirmBtn.onPress());

    expect(subscribeToMatch).toHaveBeenCalledWith(mockMatchA.id);
    expect(mockOpenModal).toHaveBeenCalled();
  });

  it("deve abrir modal direto se usuário já estiver inscrito", async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const mockOpenModal = jest.fn();

    act(() => {
      result.current.joinMatch(mockMatchB, mockOpenModal);
    });

    await waitFor(() => {
      expect(subscribeToMatch).not.toHaveBeenCalled();
      expect(mockOpenModal).toHaveBeenCalled();
    });
  });

  it("deve tratar erro 409 (Já inscrito) ao entrar", async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    (subscribeToMatch as jest.Mock).mockRejectedValue(
      createAxiosError(409, "Já inscrito"),
    );

    act(() => {
      result.current.joinMatch(mockMatchA, jest.fn());
    });
    const confirmBtn = (Alert.alert as jest.Mock).mock.calls[0][2][1];
    await act(async () => confirmBtn.onPress());

    expect(Alert.alert).toHaveBeenCalledWith("Aviso", "Já inscrito");
  });

  it("deve tratar erro 403 (Partida cheia) ao entrar", async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    (subscribeToMatch as jest.Mock).mockRejectedValue(
      createAxiosError(403, "Cheia"),
    );

    act(() => {
      result.current.joinMatch(mockMatchA, jest.fn());
    });
    const confirmBtn = (Alert.alert as jest.Mock).mock.calls[0][2][1];
    await act(async () => confirmBtn.onPress());

    expect(Alert.alert).toHaveBeenCalledWith("Partida cheia", "Cheia");
  });

  it("Web: deve entrar direto sem Alert", async () => {
    (Platform as any).OS = "web";
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.joinMatch(mockMatchA, jest.fn());
    });

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(subscribeToMatch).toHaveBeenCalled();
  });

  // --- 4. LEAVE MATCH (SAIR) ---

  it("deve sair da partida e chamar onAfterLeave (Mobile)", async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const onLeaveSpy = jest.fn();

    act(() => {
      result.current.leaveMatch(mockMatchB, onLeaveSpy);
    });
    const confirmBtn = (Alert.alert as jest.Mock).mock.calls[0][2][1];
    await act(async () => confirmBtn.onPress());

    expect(unsubscribeFromMatch).toHaveBeenCalledWith(mockMatchB.id);
    expect(onLeaveSpy).toHaveBeenCalled();
  });

  it("deve tratar erro 500 ao sair", async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    (unsubscribeFromMatch as jest.Mock).mockRejectedValue(
      createAxiosError(500, "Erro server"),
    );

    act(() => {
      result.current.leaveMatch(mockMatchB);
    });
    const confirmBtn = (Alert.alert as jest.Mock).mock.calls[0][2][1];
    await act(async () => confirmBtn.onPress());

    expect(Alert.alert).toHaveBeenCalledWith("Erro", "Erro server");
  });

  it("Web: deve sair direto", async () => {
    (Platform as any).OS = "web";
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.leaveMatch(mockMatchB);
    });

    expect(unsubscribeFromMatch).toHaveBeenCalled();
  });

  // --- 5. SWITCH TEAM (TROCAR TIME) ---

  it("deve trocar de time com sucesso (Mobile)", async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const mockUpdateModal = jest.fn();

    act(() => {
      result.current.switchTeam(mockMatchB, mockUpdateModal);
    });

    const confirmBtn = (Alert.alert as jest.Mock).mock.calls[0][2][1];
    await act(async () => confirmBtn.onPress());

    expect(switchTeamRequest).toHaveBeenCalledWith(mockMatchB.id);
    expect(mockUpdateModal).toHaveBeenCalled();
  });

  it("deve tratar erro 403 ao trocar time", async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    (switchTeamRequest as jest.Mock).mockRejectedValue(
      createAxiosError(403, "Time cheio"),
    );

    act(() => {
      result.current.switchTeam(mockMatchB, jest.fn());
    });
    const confirmBtn = (Alert.alert as jest.Mock).mock.calls[0][2][1];
    await act(async () => confirmBtn.onPress());

    expect(Alert.alert).toHaveBeenCalledWith("Aviso", "Time cheio");
  });

  it("deve tratar erro genérico (não axios) ao trocar time", async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    (switchTeamRequest as jest.Mock).mockRejectedValue(new Error("Erro X"));

    act(() => {
      result.current.switchTeam(mockMatchB, jest.fn());
    });
    const confirmBtn = (Alert.alert as jest.Mock).mock.calls[0][2][1];
    await act(async () => confirmBtn.onPress());

    expect(Alert.alert).toHaveBeenCalledWith(
      "Erro",
      expect.stringContaining("Não foi possível trocar"),
    );
  });

  it("Web: deve trocar time direto", async () => {
    (Platform as any).OS = "web";
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.switchTeam(mockMatchB, jest.fn());
    });

    expect(switchTeamRequest).toHaveBeenCalled();
  });

  // --- 6. SYNC SUBSCRIBED E FALLBACKS DE TEAMS ---

  it("deve sincronizar inscritos corretamente", async () => {
    const matchWithUser = {
      ...mockMatchB,
      teamA: { players: [{ id: "user-123" }] },
    };
    (getMatchById as jest.Mock).mockResolvedValue(matchWithUser);

    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isUserSubscriped(mockMatchB)).toBe(true);
  });

  it("deve lidar com match onde teamA ou teamB são undefined no sync e isUserSubscriped", async () => {
    const matchNoTeams = { id: "match-no-teams" };
    (getMatchesFeed as jest.Mock).mockResolvedValue({
      data: [matchNoTeams],
      meta: { page: 1, limit: 10, hasNextPage: false },
    });
    (getMatchById as jest.Mock).mockResolvedValue({
      id: "match-no-teams",
      teamA: undefined,
      teamB: undefined,
    });

    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Testa isUserSubscriped com objeto incompleto para ativar '?? []'
    expect(result.current.isUserSubscriped(matchNoTeams as any)).toBe(false);
  });

  it("deve ignorar sincronização se usuário não logado", async () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getMatchById).not.toHaveBeenCalled();
    // E isUserSubscriped deve retornar false
    expect(result.current.isUserSubscriped(mockMatchA)).toBe(false);
  });

  it("deve tratar erro na sincronização sem quebrar o app", async () => {
    (getMatchById as jest.Mock).mockRejectedValue(new Error("Falha sync"));
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.matches).toHaveLength(1);
  });
});
