import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useUser } from '@/libs/storage/UserContext';
import { useRouter } from 'expo-router';
import { createPartida } from '@/libs/criar/createPartida';
import { partidaForms } from '@/libs/hooks/partidaForms';

// --- MOCKS ---

jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: { alert: jest.fn() },
}));

jest.mock('@/libs/storage/UserContext', () => ({
  useUser: jest.fn(),
}));

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ replace: mockReplace, push: mockPush })),
}));

jest.mock('@/libs/criar/createPartida', () => ({
  createPartida: jest.fn(),
}));

describe('Hook: partidaForms', () => {
  const mockCreatePartida = createPartida as jest.Mock;
  const mockUseUser = useUser as jest.Mock;
  const mockUser = { id: 'u1', token: 'mock-token' };
  
  const validFormData = {
    titulo: "Jogo de Quinta",
    descricao: "Descricao detalhada",
    esporte: "Futebol",
    maxPlayers: 10,
    nomeEquipeA: "Time Vermelho",
    nomeEquipeB: "Time Azul",
    dataInicio: "2025-12-25",
    local: "Quadra Central",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUser.mockReturnValue({ user: mockUser });
    mockCreatePartida.mockResolvedValue({ success: true });
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.log as jest.Mock).mockRestore();
    (console.error as jest.Mock).mockRestore();
  });

  // --- Teste de Validação e Desabilitação ---
  it('deve desabilitar o botão se campos obrigatórios estiverem faltando', () => {
    const { result } = renderHook(() => partidaForms());

    // Faltando tudo -> true
    expect(result.current.isDisabled).toBe(true);

    // Preenche todos os obrigatórios
    act(() => {
      result.current.setFormData({
        ...validFormData,
        descricao: '',
        nomeEquipeA: '',
        nomeEquipeB: '',
      });
    });

    // Agora, com Título, Data, Local e Esporte -> false
    expect(result.current.isDisabled).toBe(false);
  });


  // --- Teste de Fluxo de Erro na Validação ---
  it('deve emitir alerta se o usuário não estiver logado', async () => {
    mockUseUser.mockReturnValue({ user: null });
    const { result } = renderHook(() => partidaForms());

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Usuário não encontrado, faça login novamente.');
    expect(mockReplace).toHaveBeenCalledWith('/(Auth)/login');
    expect(mockCreatePartida).not.toHaveBeenCalled();
  });
  
  it('deve emitir alerta se faltarem campos obrigatórios', async () => {
    const { result } = renderHook(() => partidaForms());
    
    // Preenche com dados inválidos (faltando local e esporte)
    act(() => {
      result.current.setFormData({
        ...validFormData,
        local: '', // Falta
        esporte: '', // Falta
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Erro',
      'Preencha os campos obrigatórios: Título, Data Início, Local e Esporte',
    );
    expect(mockCreatePartida).not.toHaveBeenCalled();
  });

  // --- Teste de Sucesso e Call API ---
  it('deve chamar createPartida com payload correto e limpar/redirecionar no sucesso', async () => {
    const { result } = renderHook(() => partidaForms());
    
    // Garante que o formulário está preenchido
    act(() => result.current.setFormData(validFormData));

    await act(async () => {
      await result.current.handleSubmit();
    });

    // 1. Verifica a chamada da API com o payload tratado
    expect(mockCreatePartida).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'u1',
      title: 'Jogo de Quinta',
      description: 'Descricao detalhada',
      sport: 'Futebol',
      maxPlayers: 10,
      teamNameA: 'Time Vermelho',
      teamNameB: 'Time Azul',
      MatchDate: '2025-12-25',
      location: 'Quadra Central',
      token: 'mock-token',
      author: mockUser,
    }));

    // 2. Verifica sucesso e redirecionamento
    expect(Alert.alert).toHaveBeenCalledWith('Sucesso', 'Partida criado com sucesso!');
    expect(mockReplace).toHaveBeenCalledWith('/(DashBoard)/(tabs)/Partidas');

    // 3. Verifica limpeza do formulário (Título deve estar vazio)
    expect(result.current.formsData.titulo).toBe('');
  });

  it('deve definir formError e nao redirecionar se createPartida retornar erro', async () => {
    const mockErrorMsg = 'Erro: Partida duplicada';
    mockCreatePartida.mockResolvedValue({ error: mockErrorMsg });
    
    const { result } = renderHook(() => partidaForms());
    act(() => result.current.setFormData(validFormData));

    await act(async () => {
      await result.current.handleSubmit();
    });

    // Erro do servidor aparece no formulário
    expect(result.current.formError).toBe(mockErrorMsg);
    expect(mockReplace).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalledWith('Sucesso', expect.anything());
  });

  // --- Teste de Navegação ---
  it('deve navegar para NovoPost em comebackPage', () => {
    const { result } = renderHook(() => partidaForms());
    
    act(() => {
      result.current.comebackPage();
    });
    
    expect(mockPush).toHaveBeenCalledWith('/(DashBoard)/(tabs)/NovoPost');
  });
});