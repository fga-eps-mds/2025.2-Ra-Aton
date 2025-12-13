import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useUser } from '@/libs/storage/UserContext';
import { useRouter } from 'expo-router';
import { createPost } from '@/libs/criar/createPost';
import { postForms } from '@/libs/hooks/postForms'; // Ajuste o caminho se necessário

// --- MOCKS ---

// 1. Mock do Alert
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: { alert: jest.fn() },
}));

// 2. Mock do Contexto de Usuário
jest.mock('@/libs/storage/UserContext', () => ({
  useUser: jest.fn(),
}));

// 3. Mock do Router
const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ replace: mockReplace, push: mockPush })),
}));

// 4. Mock do serviço createPost
jest.mock('@/libs/criar/createPost', () => ({
  createPost: jest.fn(),
}));

describe('Hook: postForms', () => {
  const mockCreatePost = createPost as jest.Mock;
  const mockUseUser = useUser as jest.Mock;
  
  // Dados de teste
  const mockUser = { id: 'u1', token: 'mock-token', name: 'User Teste' };
  const mockGroupId = 'group-123';

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup padrão: usuário logado e API retornando sucesso
    mockUseUser.mockReturnValue({ user: mockUser });
    mockCreatePost.mockResolvedValue({ success: true });
    
    // Silencia logs
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('deve inicializar o formulário com os valores padrão', () => {
    // Passamos null como groupId inicial
    const { result } = renderHook(() => postForms(null));

    expect(result.current.formsData).toEqual({
      titulo: "",
      descricao: "",
    });
    expect(result.current.loading).toBe(false);
    // Deve estar desabilitado pois não tem título nem grupo
    expect(result.current.isDisabled).toBe(true); 
  });

  it('deve atualizar os campos do formulário via setFormData', () => {
    const { result } = renderHook(() => postForms(null));

    act(() => {
      result.current.setFormData((prev) => ({
        ...prev,
        titulo: 'Novo Post',
        descricao: 'Conteúdo do post'
      }));
    });

    expect(result.current.formsData.titulo).toBe('Novo Post');
    expect(result.current.formsData.descricao).toBe('Conteúdo do post');
  });

  it('deve alertar erro e redirecionar para login se usuário não estiver logado', async () => {
    mockUseUser.mockReturnValue({ user: null }); // Usuário deslogado
    const { result } = renderHook(() => postForms(mockGroupId));

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(Alert.alert).toHaveBeenCalledWith("Erro", "Usuário não encontrado, faça login novamente.");
    expect(mockReplace).toHaveBeenCalledWith("/(Auth)/login");
    expect(mockCreatePost).not.toHaveBeenCalled();
  });

  it('deve alertar erro se o título não for preenchido', async () => {
    const { result } = renderHook(() => postForms(mockGroupId));

    // Formulário vazio
    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Erro",
      "Preencha os campos obrigatórios: Título"
    );
    expect(mockCreatePost).not.toHaveBeenCalled();
  });

  it('deve alertar erro se nenhum grupo for selecionado (selectedGroupId nulo)', async () => {
    const { result } = renderHook(() => postForms(null)); // groupId é null

    act(() => {
      result.current.setFormData({ titulo: 'Titulo Valido', descricao: '' });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Erro",
      "Selecione um grupo para criar o post"
    );
    expect(mockCreatePost).not.toHaveBeenCalled();
  });

  it('deve criar post com sucesso e redirecionar', async () => {
    const { result } = renderHook(() => postForms(mockGroupId));

    act(() => {
      result.current.setFormData({
        titulo: 'Meu Post',
        descricao: 'Texto descritivo',
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    // 1. Verifica chamada ao serviço
    expect(mockCreatePost).toHaveBeenCalledWith({
      title: 'Meu Post',
      type: 'GENERAL',
      content: 'Texto descritivo',
      token: mockUser.token,
      groupId: mockGroupId,
    });

    // 2. Verifica alerta de sucesso
    expect(Alert.alert).toHaveBeenCalledWith("Sucesso", "Post criado com sucesso!");

    // 3. Verifica limpeza do formulário
    expect(result.current.formsData.titulo).toBe('');
    expect(result.current.formsData.descricao).toBe('');

    // 4. Verifica redirecionamento
    expect(mockReplace).toHaveBeenCalledWith("/(DashBoard)/(tabs)/Home");
  });

  it('deve enviar content como undefined se a descrição estiver vazia ou apenas espaços', async () => {
      const { result } = renderHook(() => postForms(mockGroupId));

    act(() => {
      result.current.setFormData({
        titulo: 'Post sem descrição',
        descricao: '   ', // Espaços em branco devem ser tratados pelo trim()
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockCreatePost).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Post sem descrição',
      content: undefined, // O código faz: descricao?.trim() || undefined
    }));
  });

  it('deve definir formError e não redirecionar se a API retornar erro', async () => {
    const mockErrorMsg = "Título inválido";
    mockCreatePost.mockResolvedValue({ error: mockErrorMsg }); // API retorna erro

    const { result } = renderHook(() => postForms(mockGroupId));

    act(() => {
      result.current.setFormData({
        titulo: 'Erro Post',
        descricao: ''
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
    const errorCatch = new Error("Network Error");
    mockCreatePost.mockRejectedValue(errorCatch);

    const { result } = renderHook(() => postForms(mockGroupId));

    act(() => {
      result.current.setFormData({
        titulo: 'Post Exception',
        descricao: ''
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(Alert.alert).toHaveBeenCalledWith("Erro ao criar post", "Network Error");
    expect(result.current.loading).toBe(false);
  });

  it('deve navegar para NovoPost ao chamar comebackPage', () => {
    const { result } = renderHook(() => postForms(mockGroupId));

    act(() => {
      result.current.comebackPage();
    });

    expect(mockPush).toHaveBeenCalledWith("/(DashBoard)/(tabs)/NovoPost");
  });
});