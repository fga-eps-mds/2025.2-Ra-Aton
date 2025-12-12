import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useSolicitacoes } from '@/libs/hooks/getSolicitacoes';
import { loadSolicitacoes } from '@/libs/solicitacoes/loadSolicitacoes';
import { useUser } from '@/libs/storage/UserContext';

jest.mock('@/libs/solicitacoes/loadSolicitacoes', () => ({
  loadSolicitacoes: jest.fn(),
}));


jest.mock('@/libs/storage/UserContext', () => ({
  useUser: jest.fn(),
}));


let focusCallback: (() => void) | null = null;

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn((callback) => {
    focusCallback = callback;
  }),
}));

describe('Hook: useSolicitacoes', () => {
  const mockLoadSolicitacoes = loadSolicitacoes as jest.Mock;
  const mockUseUser = useUser as jest.Mock;

  const mockUser = { id: 'user-123', userName: 'Tester' };
  const mockSolicitacoesData = [{ id: '1', status: 'PENDING' }];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUser.mockReturnValue({ user: mockUser });
    focusCallback = null;
  });

  
  it('deve interromper a execução (return) se não houver user.id dentro do load', async () => {
    mockUseUser.mockReturnValue({ user: null });

    const { result } = renderHook(() => useSolicitacoes());

    mockLoadSolicitacoes.mockClear();


    await act(async () => {
      await result.current.load();
    });

    expect(mockLoadSolicitacoes).not.toHaveBeenCalled();
  });


  it('deve carregar as solicitações com sucesso ao iniciar', async () => {
    mockLoadSolicitacoes.mockResolvedValue(mockSolicitacoesData);

    const { result } = renderHook(() => useSolicitacoes());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockLoadSolicitacoes).toHaveBeenCalledWith(mockUser.id);
    expect(result.current.solicitacoes).toEqual(mockSolicitacoesData);
    expect(result.current.error).toBeNull();
  });


  it('deve recarregar os dados quando a tela ganhar foco (teste da linha 50)', async () => {
    mockLoadSolicitacoes.mockResolvedValue(mockSolicitacoesData);

    const { result } = renderHook(() => useSolicitacoes());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockLoadSolicitacoes).toHaveBeenCalledTimes(1);

    expect(focusCallback).toBeDefined();
    await act(async () => {
      if (focusCallback) focusCallback(); 
    });

    expect(mockLoadSolicitacoes).toHaveBeenCalledTimes(2);
  });

  it('NÃO deve recarregar no foco se não houver usuário (teste do if na linha 50)', async () => {
    const { result, rerender } = renderHook(() => useSolicitacoes());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mockUseUser.mockReturnValue({ user: null });
    rerender();

    await act(async () => {
      if (focusCallback) focusCallback();
    });

    expect(mockLoadSolicitacoes).toHaveBeenCalledTimes(1);
  });


  it('deve capturar erros e atualizar o estado error (teste do catch)', async () => {
    const mockError = new Error('Falha na conexão');
    mockLoadSolicitacoes.mockRejectedValue(mockError);

    const { result } = renderHook(() => useSolicitacoes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.solicitacoes).toEqual([]);
  });
});