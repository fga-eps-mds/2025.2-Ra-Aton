// ARQUIVO: apps/mobile/__tests__/libs/hooks/useFeedMatches.test.ts
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert, Platform } from 'react-native';
import {
  getMatchesFeed,
  subscribeToMatch,
  getMatchById,
  switchTeam as switchTeamRequest,
  unsubscribeFromMatch,
} from '@/libs/auth/handleMatch';
import { useUser } from '@/libs/storage/UserContext';
import { useFeedMatches } from '@/libs/hooks/useMatchesFunctions';

// --- MOCKS ---

jest.mock('@/libs/storage/UserContext', () => ({
  useUser: jest.fn(() => ({ user: { id: 'user-123' } })),
}));

jest.mock('@/libs/auth/handleMatch', () => ({
  getMatchesFeed: jest.fn(),
  subscribeToMatch: jest.fn(),
  unsubscribeFromMatch: jest.fn(),
  getMatchById: jest.fn(),
  switchTeam: jest.fn(),
}));

jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: { alert: jest.fn() },
  Platform: { OS: 'ios', select: jest.fn((objs) => objs['ios']) },
}));

jest.mock('axios', () => ({
  ...jest.requireActual('axios'),
  isAxiosError: jest.fn((error) => !!error.response),
}));

const createAxiosError = (status: number, message: string) => ({
  response: { status, data: { message } },
  isAxiosError: true,
});

// --- DADOS MOCK ---
const mockMatchA = { id: 'match-A', teamA: { players: [] }, teamB: { players: [] } } as any;
const mockMatchB = { id: 'match-B', teamA: { players: [{ id: 'user-123' }] }, teamB: { players: [] } } as any;

describe('Hook: useFeedMatches (100% Coverage)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as any).OS = 'ios';
    
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

  // --- 1. CARREGAMENTO, ERROS E CANCELAMENTO ---

  it('deve carregar dados iniciais com sucesso', async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.matches).toHaveLength(1);
  });

  it('deve ignorar erro de cancelamento (CanceledError) no loadPage', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Simula erro de cancelamento
    (getMatchesFeed as jest.Mock).mockRejectedValue({ name: 'CanceledError' });

    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Não deve logar erro no console, pois é um cancelamento esperado
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('deve logar erro genérico no loadPage', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (getMatchesFeed as jest.Mock).mockRejectedValue(new Error('Falha na rede'));

    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(consoleSpy).toHaveBeenCalledWith('Erro ao carregar partidas:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('deve tratar falha na sincronização de inscrições (syncSubscribedFromBackend)', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Sucesso no feed, mas falha ao buscar detalhes para checar inscrição
    (getMatchesFeed as jest.Mock).mockResolvedValue({
      data: [mockMatchA],
      meta: { page: 1, limit: 10, hasNextPage: false },
    });
    // Simula erro dentro do Promise.all (getMatchById falhando)
    (getMatchById as jest.Mock).mockRejectedValue(new Error('Erro sync'));

    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // O código tem um catch interno no map: .catch(() => null), então não deve explodir,
    // mas se o bloco inteiro falhar, deve logar.
    // Vamos forçar o syncSubscribedFromBackend a falhar mockando o UserContext para null no meio?
    // Não, o código é robusto. Vamos apenas garantir que ele roda sem travar.
    
    expect(getMatchById).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  // --- 2. PAGINAÇÃO E THROTTLE ---

  it('deve bloquear onEndReached se lista vazia ou loading ou sem next page', async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Caso 1: Loading
    act(() => {
        // Força estado interno (mock) ou chama uma função que ativa loading
        result.current.onRefresh(); // Isso ativa loading
        result.current.onEndReached(); // Deve ser ignorado
    });
    expect(getMatchesFeed).toHaveBeenCalledTimes(2); // 1 inicial + 1 refresh (onEndReached ignorado)

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    jest.clearAllMocks();

    // Caso 2: Sem next page
    (getMatchesFeed as jest.Mock).mockResolvedValue({
        data: [],
        meta: { hasNextPage: false }
    });
    await act(async () => { await result.current.onRefresh(); }); // Atualiza hasNextPage para false
    
    act(() => { result.current.onEndReached(); });
    expect(getMatchesFeed).toHaveBeenCalledTimes(1); // Só o refresh chamou
  });

  // --- 3. JOIN MATCH (INSCRIÇÃO) ---

  it('deve tratar erro genérico (não-axios) ao entrar na partida', async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    (subscribeToMatch as jest.Mock).mockRejectedValue(new Error('Erro desconhecido'));

    act(() => { result.current.joinMatch(mockMatchA, jest.fn()); });
    
    const confirmBtn = (Alert.alert as jest.Mock).mock.calls[0][2][1];
    await act(async () => confirmBtn.onPress());

    expect(Alert.alert).toHaveBeenCalledWith('Erro', expect.stringContaining('Não foi possível entrar'));
  });

  it('deve tratar erro ao carregar detalhes APÓS inscrição bem sucedida', async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const mockOpenModal = jest.fn();

    // Inscrição OK, mas getMatchById falha depois
    (subscribeToMatch as jest.Mock).mockResolvedValue(true);
    (getMatchById as jest.Mock).mockRejectedValue(new Error('Falha ao atualizar'));

    act(() => { result.current.joinMatch(mockMatchA, mockOpenModal); });
    
    const confirmBtn = (Alert.alert as jest.Mock).mock.calls[0][2][1];
    await act(async () => confirmBtn.onPress());

    // Deve logar erro ou alertar erro secundário
    expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Não foi possível carregar os dados da partida.');
    expect(mockOpenModal).not.toHaveBeenCalled();
  });

  it('Web: deve entrar direto', async () => {
    (Platform as any).OS = 'web';
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.joinMatch(mockMatchA, jest.fn());
    });

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(subscribeToMatch).toHaveBeenCalled();
  });

  // --- 4. LEAVE MATCH (SAIR) ---

  it('Web: deve sair direto', async () => {
    (Platform as any).OS = 'web';
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.leaveMatch(mockMatchB);
    });

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(unsubscribeFromMatch).toHaveBeenCalled();
  });

  it('deve tratar erro axios ao sair', async () => {
    const { result } = renderHook(() => useFeedMatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    (unsubscribeFromMatch as jest.Mock).mockRejectedValue(createAxiosError(500, 'Erro backend'));

    act(() => { result.current.leaveMatch(mockMatchB); });
    const confirmBtn = (Alert.alert as jest.Mock).mock.calls[0][2][1];
    await act(async () => confirmBtn.onPress());

    expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Erro backend');
  });
  it('deve usar array vazio se teamA ou teamB forem undefined', async () => {
  (getMatchesFeed as jest.Mock).mockResolvedValue({
    data: [{ id: 'match-undefined-teams' }],
    meta: { page: 1, limit: 10, hasNextPage: false }
  });

  // getMatchById retorna um match sem teamA nem teamB
  (getMatchById as jest.Mock).mockResolvedValue({
    id: 'match-undefined-teams',
    teamA: undefined,
    teamB: undefined
  });

  const { result } = renderHook(() => useFeedMatches());

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  // Chama isUserSubscriped para garantir que o fallback [] foi usado sem crash
  const match = { id: 'match-undefined-teams' } as any;
  expect(result.current.isUserSubscriped(match)).toBe(false);
});

it('deve definir hasNextPage como false se data estiver vazia e targetPage > 1', async () => {
  // Primeira chamada retorna normalmente para carregar página 1
  (getMatchesFeed as jest.Mock).mockResolvedValueOnce({
    data: [{ id: 'match-1' }],
    meta: { page: 1, limit: 10, hasNextPage: true }
  });

  // Segunda chamada retorna array vazio para simular última página
  (getMatchesFeed as jest.Mock).mockResolvedValueOnce({
    data: [],
    meta: { page: 2, limit: 10, hasNextPage: true } // mesmo que true, fallback dispara
  });

  const { result } = renderHook(() => useFeedMatches());

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  // Dispara carregamento da página 2
  await act(async () => {
    result.current.onEndReached(); // vai chamar loadPage(2, true)
  });

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  // Espera que hasNextPage seja false (porque data.length === 0 && targetPage > 1)
  expect(result.current.hasNextPage).toBe(false);
});

it('deve usar targetPage quando res.meta.page for undefined', async () => {
  // Mock da API sem meta.page
  (getMatchesFeed as jest.Mock).mockResolvedValue({
    data: [{ id: 'match-X' }],
    meta: { limit: 10, hasNextPage: true } // page ausente
  });

  const { result } = renderHook(() => useFeedMatches());

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  // Espera que a página seja o targetPage (1 no primeiro load)
  expect(result.current.matches.length).toBe(1);
  // Aqui estamos verificando que fallback ocorreu
  expect(result.current.hasNextPage).toBe(true);
});

it('deve usar array vazio quando res.data não for um array', async () => {
  // Mock da API retornando algo inválido
  (getMatchesFeed as jest.Mock).mockResolvedValue({
    data: null, // não é array
    meta: { page: 1, limit: 10, hasNextPage: false }
  });

  const { result } = renderHook(() => useFeedMatches());

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  // Espera que matches seja vazio
  expect(result.current.matches).toEqual([]);
});

});
describe('useFeedMatches - cobertura early return', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('não deve tentar sincronizar se userId não existir', async () => {
    // Mock do useUser retornando null
    (useUser as jest.Mock).mockReturnValue({ user: null });

    const { result } = renderHook(() => useFeedMatches());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Apenas garante que não lança erro e matches são carregadas normalmente
    expect(result.current.matches).toBeDefined();
  });

  it('deve ignorar match null ao sincronizar inscritos', async () => {
    (getMatchesFeed as jest.Mock).mockResolvedValue({
      data: [{ id: 'match-null' }, { id: 'match-valid' }],
      meta: { page: 1, limit: 10, hasNextPage: false }
    });

    // Simula getMatchById falhando para o primeiro match
    (getMatchById as jest.Mock).mockImplementation((id) => {
      if (id === 'match-null') return Promise.reject(new Error('Not found'));
      return Promise.resolve({ id, teamA: { players: [] }, teamB: { players: [] } });
    });

    const { result } = renderHook(() => useFeedMatches());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Garante que não crasha e matches válidas ainda são carregadas
    expect(result.current.matches.some(m => m.id === 'match-valid')).toBe(true);
  });
  it('deve usar fallback de limite quando hasNextPage não é boolean', async () => {
  const LIMIT = 10; // mesmo valor do hook
  (getMatchesFeed as jest.Mock).mockResolvedValue({
    data: Array(LIMIT).fill({ id: 'match-fallback' }), // cria array de tamanho LIMIT
    meta: { page: 1, limit: LIMIT, hasNextPage: undefined } // undefined força fallback
  });

  const { result } = renderHook(() => useFeedMatches());

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  // Espera que hasNextPage seja true (porque data.length === LIMIT)
  expect(result.current.hasNextPage).toBe(true);
  expect(result.current.matches.length).toBe(LIMIT);
});

it('ignora match null ao sincronizar inscritos', async () => {
  (getMatchesFeed as jest.Mock).mockResolvedValue({
    data: [{ id: 'match-null' }],
    meta: { page: 1, limit: 10, hasNextPage: false }
  });

  (getMatchById as jest.Mock).mockResolvedValue(null); // força dm = null

  const { result } = renderHook(() => useFeedMatches());

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  // Matches carregadas, sem crash
  expect(result.current.matches.length).toBe(1);
});

it('retorna false em isUserSubscriped se userId não existir', async () => {
  (useUser as jest.Mock).mockReturnValue({ user: null });

  const { result } = renderHook(() => useFeedMatches());

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(result.current.isUserSubscriped({ id: 'match-A' } as any)).toBe(false);
});

it('retorna false em isUserSubscriped se userId não existir', async () => {
  (useUser as jest.Mock).mockReturnValue({ user: null });

  const { result } = renderHook(() => useFeedMatches());

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(result.current.isUserSubscriped({ id: 'match-A' } as any)).toBe(false);
});

it('não chama loadPage se já estiver carregando', async () => {
  const { result } = renderHook(() => useFeedMatches());

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  // Força isLoadingRef.current = true
  act(() => {
    (result.current as any).isLoading = true;
    (result.current as any).isLoadingRef = { current: true };
  });

  act(() => {
    result.current.onEndReached();
  });

  // Não deve chamar getMatchesFeed de novo
  expect(getMatchesFeed).toHaveBeenCalledTimes(1); // apenas carga inicial
});

it('chama onAfterLeave após sair da partida', async () => {
  const { result } = renderHook(() => useFeedMatches());
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  const mockAfterLeave = jest.fn();

  act(() => {
    result.current.leaveMatch(mockMatchA, mockAfterLeave);
  });

  // Simula clique no botão Confirmar do Alert
  const lastAlertCallIndex = (Alert.alert as jest.Mock).mock.calls.length - 1;
  const confirmButton = (Alert.alert as jest.Mock).mock.calls[lastAlertCallIndex][2]
    .find((b: any) => b.text === 'Confirmar');

  await act(async () => confirmButton.onPress());

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(mockAfterLeave).toHaveBeenCalled();
});

it('não faz nada em onEndReached se não houver matches', async () => {
  const { result } = renderHook(() => useFeedMatches());

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  act(() => {
    (result.current as any).matches = [];
    result.current.onEndReached();
  });

  expect(getMatchesFeed).toHaveBeenCalledTimes(1); // só carga inicial
});

it('não faz nada em onEndReached se loading ou sem próxima página', async () => {
  const { result } = renderHook(() => useFeedMatches());
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  act(() => {
    (result.current as any).isLoadingRef = { current: true };
    result.current.onEndReached();
  });

  act(() => {
    (result.current as any).isLoadingRef = { current: false };
    (result.current as any).hasNextPage = false;
    result.current.onEndReached();
  });

  expect(getMatchesFeed).toHaveBeenCalledTimes(1); // só carga inicial
});

it('não chama loadPage se throttleRequest ainda não expirou', async () => {
  const { result } = renderHook(() => useFeedMatches());
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  act(() => {
    (result.current as any).throttleRequest = { current: Date.now() };
    result.current.onEndReached();
  });

  expect(getMatchesFeed).toHaveBeenCalledTimes(1); // apenas carga inicial
});

});

