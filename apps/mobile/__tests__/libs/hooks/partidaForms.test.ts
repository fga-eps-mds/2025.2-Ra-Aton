import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useUser } from '@/libs/storage/UserContext';
import { useRouter } from 'expo-router';
import { createPartida } from '@/libs/criar/createPartida';
import { partidaForms } from '@/libs/hooks/partidaForms';


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
  
  const mockUser = { id: 'u1', token: 'mock-token', name: 'User Teste' };
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUser.mockReturnValue({ user: mockUser });
    mockCreatePartida.mockResolvedValue({ success: true });
    
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('deve inicializar o formulário com os valores padrão', () => {
    const { result } = renderHook(() => partidaForms());

    expect(result.current.formsData).toEqual({
      titulo: "",
      descricao: "",
      esporte: "",
      maxPlayers: 6,
      nomeEquipeA: "",
      nomeEquipeB: "",
      dataInicio: "",
      local: "",
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.isDisabled).toBe(true); 
  });

  it('deve atualizar os campos do formulário via setFormData', () => {
    const { result } = renderHook(() => partidaForms());

    act(() => {
      result.current.setFormData((prev) => ({
        ...prev,
        titulo: 'Futebol de Domingo',
        esporte: 'Futebol'
      }));
    });

    expect(result.current.formsData.titulo).toBe('Futebol de Domingo');
    expect(result.current.formsData.esporte).toBe('Futebol');
  });

  it('deve alertar erro e redirecionar para login se usuário não estiver logado', async () => {
    mockUseUser.mockReturnValue({ user: null }); 
    const { result } = renderHook(() => partidaForms());

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(Alert.alert).toHaveBeenCalledWith("Erro", "Usuário não encontrado, faça login novamente.");
    expect(mockReplace).toHaveBeenCalledWith("/(Auth)/login");
    expect(mockCreatePartida).not.toHaveBeenCalled();
  });

  it('deve alertar erro se campos obrigatórios não forem preenchidos', async () => {
    const { result } = renderHook(() => partidaForms());

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Erro",
      "Preencha os campos obrigatórios: Título, Data Início, Local e Esporte"
    );
    expect(mockCreatePartida).not.toHaveBeenCalled();
  });

  it('deve criar partida com sucesso e redirecionar', async () => {
    const { result } = renderHook(() => partidaForms());

    act(() => {
      result.current.setFormData({
        titulo: 'Vôlei na Praia',
        descricao: 'Jogo amistoso',
        esporte: 'Vôlei',
        maxPlayers: 10,
        nomeEquipeA: 'Time Sol',
        nomeEquipeB: 'Time Mar',
        dataInicio: '2025-10-10',
        local: 'Praia de Copacabana',
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockCreatePartida).toHaveBeenCalledWith({
      author: mockUser,
      userId: mockUser.id,
      title: 'Vôlei na Praia',
      description: 'Jogo amistoso',
      sport: 'Vôlei',
      maxPlayers: 10,
      teamNameA: 'Time Sol',
      teamNameB: 'Time Mar',
      MatchDate: '2025-10-10',
      location: 'Praia de Copacabana',
      token: mockUser.token,
    });

    expect(Alert.alert).toHaveBeenCalledWith("Sucesso", "Partida criado com sucesso!");

    expect(result.current.formsData.titulo).toBe('');
    expect(result.current.formsData.esporte).toBe('');

    expect(mockReplace).toHaveBeenCalledWith("/(DashBoard)/(tabs)/Partidas");
  });

  it('deve definir formError e não redirecionar se a API retornar erro', async () => {
    const mockErrorMsg = "Data inválida";
    mockCreatePartida.mockResolvedValue({ error: mockErrorMsg });

    const { result } = renderHook(() => partidaForms());

    act(() => {
      result.current.setFormData({
        titulo: 'Partida Errada',
        esporte: 'Xadrez',
        dataInicio: '2020-01-01',
        local: 'Clube',
        descricao: '',
        maxPlayers: 2,
        nomeEquipeA: '',
        nomeEquipeB: ''
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.formError).toBe(mockErrorMsg);
    expect(Alert.alert).not.toHaveBeenCalledWith("Sucesso", expect.anything());
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('deve tratar exceções (try/catch) durante a criação', async () => {
    const errorCatch = new Error("Falha na rede");
    mockCreatePartida.mockRejectedValue(errorCatch);

    const { result } = renderHook(() => partidaForms());

    act(() => {
      result.current.setFormData({
        titulo: 'Partida Teste',
        esporte: 'Teste',
        dataInicio: '2025-01-01',
        local: 'Local',
        descricao: '',
        maxPlayers: 4,
        nomeEquipeA: '',
        nomeEquipeB: ''
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(Alert.alert).toHaveBeenCalledWith("Erro ao criar partida", "Falha na rede");
    expect(result.current.loading).toBe(false);
  });

  it('deve navegar para NovoPost ao chamar comebackPage', () => {
    const { result } = renderHook(() => partidaForms());

    act(() => {
      result.current.comebackPage();
    });

    expect(mockPush).toHaveBeenCalledWith("/(DashBoard)/(tabs)/NovoPost");
  });
});