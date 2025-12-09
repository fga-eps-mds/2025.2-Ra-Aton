jest.mock("expo-secure-store", () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn(), deleteItemAsync: jest.fn() }));
jest.mock("expo-router", () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() } }));
jest.mock("@react-navigation/bottom-tabs", () => ({ createBottomTabNavigator: () => ({}) }));

jest.mock("@/libs/auth/handleMyMatches");
jest.mock("@/libs/storage/UserContext");

import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useMyMatches } from "@/libs/hooks/useMyMatches";
import * as handleMyMatches from "@/libs/auth/handleMyMatches";
import { useUser } from "@/libs/storage/UserContext";
import { Imatches } from "@/libs/interfaces/Imatches";

describe("useMyMatches", () => {
  beforeEach(() => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: "1", token: "abc" } });
  });

  it("deve carregar partidas e atualizar estado", async () => {
    const matchesMock: Imatches[] = [
      {
        id: "1",
        title: "Partida 1",
        description: "Partida amistosa",
        authorId: "user123",
        matchDate: new Date().toISOString(),
        MatchStatus: "pending",
        location: "Campo A",
        sport: "Futebol",
        maxPlayers: 10,
        teamNameA: "Time A",
        teamNameB: "Time B",
        teamAScore: 0,
        teamBScore: 0,
        createdAt: new Date().toISOString(),
        isSubscriptionOpen: true,
        spots: { totalMax: 10, totalFilled: 2 },
        teamA: {
          name: "Time A",
          max: 5,
          filled: 2,
          isOpen: 1,
          players: [{ id: "p1", name: "Jogador 1", userName: "player1" }],
        },
        teamB: {
          name: "Time B",
          max: 5,
          filled: 2,
          isOpen: 1,
          players: [{ id: "p2", name: "Jogador 2", userName: "player2" }],
        },
      },
    ];

    (handleMyMatches.getAllMatchesByUserId as jest.Mock).mockResolvedValue(matchesMock);

    const { result } = renderHook(() => useMyMatches());

    // aguarda isLoading ficar false
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.matches).toEqual(matchesMock);
  });

  it("deve lidar com refresh corretamente", async () => {
    const matchesMock: Imatches[] = [
      {
        id: "2",
        title: "Partida 2",
        description: "Partida amistosa",
        authorId: "user123",
        matchDate: new Date().toISOString(),
        MatchStatus: "pending",
        location: "Campo B",
        sport: "Futebol",
        maxPlayers: 10,
        teamNameA: "Time A",
        teamNameB: "Time B",
        teamAScore: 0,
        teamBScore: 0,
        createdAt: new Date().toISOString(),
        isSubscriptionOpen: true,
        spots: { totalMax: 10, totalFilled: 2 },
        teamA: {
          name: "Time A",
          max: 5,
          filled: 2,
          isOpen: 1,
          players: [{ id: "p1", name: "Jogador 1", userName: "player1" }],
        },
        teamB: {
          name: "Time B",
          max: 5,
          filled: 2,
          isOpen: 1,
          players: [{ id: "p2", name: "Jogador 2", userName: "player2" }],
        },
      },
    ];

    (handleMyMatches.getAllMatchesByUserId as jest.Mock).mockResolvedValue(matchesMock);

    const { result } = renderHook(() => useMyMatches());

    // aguarda carregamento inicial
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // executa refresh
    await act(async () => {
      await result.current.onRefresh();
    });

    expect(result.current.matches).toEqual(matchesMock);
    expect(result.current.isRefreshing).toBe(false);
  });

  it("deve tratar quando a API retorna não-array (null) e setar array vazio", async () => {
    (handleMyMatches.getAllMatchesByUserId as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useMyMatches());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.matches).toEqual([]);
  });

  it("deve ignorar erros de cancelamento (CanceledError / ERR_CANCELED / canceled)", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // simula rejeição com objeto indicando cancelamento
    (handleMyMatches.getAllMatchesByUserId as jest.Mock).mockRejectedValueOnce({ name: "CanceledError" });

    const { result } = renderHook(() => useMyMatches());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("deve prevenir chamadas concorrentes via isLoadingRef", async () => {
    const deferred: any = {};
    deferred.promise = new Promise((res) => { deferred.resolve = res; });

    const matchesMock = [];

    const mockFn = jest.fn().mockImplementation(() => deferred.promise);
    (handleMyMatches.getAllMatchesByUserId as jest.Mock).mockImplementation(mockFn);

    const { result } = renderHook(() => useMyMatches());

    // Inicialmente o load já foi disparado e está pendente (promise não resolvida)
    // Disparar chamadas concorrentes enquanto a primeira está pendente
    await act(async () => {
      const p1 = result.current.reloadFeed();
      const p2 = result.current.onRefresh();
      // resolve a promessa pendente
      deferred.resolve(matchesMock);
      await Promise.all([p1, p2]);
    });

    // Espera até isLoading ficar false
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // A função da API deve ter sido chamada apenas uma vez (prevenção de concorrência)
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("deve abortar requisição ao desmontar (unmount)", async () => {
    const originalAbort = (global as any).AbortController;
    const abortSpy = jest.fn();

    class FakeAbortController {
      signal: any;
      constructor() {
        this.signal = {};
        (this as any).abort = abortSpy;
      }
    }

    (global as any).AbortController = FakeAbortController;

    try {
      const { unmount } = renderHook(() => useMyMatches());

      // desmonta o hook para disparar abort
      unmount();

      // abort deve ter sido chamado
      expect(abortSpy).toHaveBeenCalled();
    } finally {
      (global as any).AbortController = originalAbort;
    }
  });
});
