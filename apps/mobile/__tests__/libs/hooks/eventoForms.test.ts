import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useUser } from '@/libs/storage/UserContext';
import { useRouter } from 'expo-router';
import { createEvent } from '@/libs/criar/createEvento';
import { eventoForms } from '@/libs/hooks/eventoForms';

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

jest.mock('@/libs/criar/createEvento', () => ({
  createEvent: jest.fn(),
}));

describe('Hook: eventoForms', () => {
  const mockCreateEvent = createEvent as jest.Mock;
  const mockUseUser = useUser as jest.Mock;
  const mockUser = { id: 'u1', token: 'mock-token' };
  const mockGroupId = 'grupo-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUser.mockReturnValue({ user: mockUser });
    mockCreateEvent.mockResolvedValue({ success: true });
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.log as jest.Mock).mockRestore();
    (console.error as jest.Mock).mockRestore();
  });

  // --- Teste de Validação ---
  it('deve desabilitar o botão se campos obrigatórios ou groupId estiverem faltando', () => {
    const { result } = renderHook(() => eventoForms(mockGroupId));

    // Padrão: tudo vazio -> isDisabled = true
    expect(result.current.isDisabled).toBe(true);

    // Falta groupId e campos obrigatórios
    const { result: res2 } = renderHook(() => eventoForms(null));
    expect(res2.current.isDisabled).toBe(true);
    
    // Preenche tudo (Exceto descrição, que é opcional)
    act(() => {
      result.current.setFormData({
        titulo: 'Reuniao',
        descricao: 'Teste',
        dataInicio: '2025-01-01',
        dataFim: '',
        local: 'Sala X',
      });
    });

    // Agora, com dados válidos e groupId presente, deve ser false
    expect(result.current.isDisabled).toBe(false);
  });

  // --- Teste de Fluxo de Erro na Validação ---
  it('deve emitir alerta se o usuário não estiver logado', async () => {
    mockUseUser.mockReturnValue({ user: null });
    const { result } = renderHook(() => eventoForms(mockGroupId));

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Usuário não encontrado, faça login novamente.');
    expect(mockReplace).toHaveBeenCalledWith('/(Auth)/login');
    expect(mockCreateEvent).not.toHaveBeenCalled();
  });
  
  it('deve emitir alerta se faltarem campos obrigatórios', async () => {
    const { result } = renderHook(() => eventoForms(mockGroupId));
    
    // Falta título e local
    act(() => {
      result.current.setFormData({
        titulo: '', 
        descricao: 'Descrição',
        dataInicio: '2025-01-01',
        dataFim: '',
        local: '',
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Erro',
      'Preencha os campos obrigatórios: Título, Data Início e Local',
    );
    expect(mockCreateEvent).not.toHaveBeenCalled();
  });

  it('deve emitir alerta se selectedGroupId estiver faltando', async () => {
    const { result } = renderHook(() => eventoForms(null)); // groupId = null
    
    // Preenche o formulário
    act(() => {
      result.current.setFormData({
        titulo: 'Reuniao',
        descricao: '',
        dataInicio: '2025-01-01',
        dataFim: '',
        local: 'Sala X',
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Selecione um grupo para criar o evento');
    expect(mockCreateEvent).not.toHaveBeenCalled();
  });

  // --- Teste de Sucesso e Call API ---
  it('deve chamar createEvent com payload correto e limpar/redirecionar no sucesso', async () => {
    const { result } = renderHook(() => eventoForms(mockGroupId));
    
    act(() => {
      result.current.setFormData({
        titulo: 'Evento Titulo',
        descricao: 'Detalhes.',
        dataInicio: '2025-01-01',
        dataFim: '2025-01-02',
        local: 'Campus Principal',
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    // 1. Verifica a chamada da API com o payload tratado
    expect(createEvent).toHaveBeenCalledWith({
      title: 'Evento Titulo',
      type: 'EVENT',
      content: 'Detalhes.', // Descrição não deve ser undefined se for string vazia, mas sim trimada
      eventDate: '2025-01-01',
      eventFinishDate: '2025-01-02',
      location: 'Campus Principal',
      token: 'mock-token',
      groupId: 'grupo-123',
    });

    // 2. Verifica sucesso e redirecionamento
    expect(Alert.alert).toHaveBeenCalledWith('Sucesso', 'Evento criado com sucesso!');
    expect(mockReplace).toHaveBeenCalledWith('/(DashBoard)/(tabs)/Home');

    // 3. Verifica limpeza do formulário
    expect(result.current.formsData.titulo).toBe('');
    expect(result.current.formsData.descricao).toBe('');
  });

  it('deve definir formError e nao redirecionar se createEvent retornar erro', async () => {
    const mockErrorMsg = 'Erro de validação do servidor';
    mockCreateEvent.mockResolvedValue({ error: mockErrorMsg });
    
    const { result } = renderHook(() => eventoForms(mockGroupId));
    
    act(() => {
      result.current.setFormData({
        titulo: 'Evento',
        descricao: '',
        dataInicio: '2025-01-01',
        dataFim: '',
        local: 'Local',
      });
    });

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
    const { result } = renderHook(() => eventoForms(mockGroupId));
    
    act(() => {
      result.current.comebackPage();
    });
    
    expect(mockPush).toHaveBeenCalledWith('/(DashBoard)/(tabs)/NovoPost');
  });
});