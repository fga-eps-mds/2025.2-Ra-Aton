import { getComments, postComment } from '@/libs/auth/handleComments';
import { api_route } from '@/libs/auth/api';

// --- MOCKS ---

// Usamos o alias @/ para garantir que o Jest encontre o módulo correto
jest.mock('@/libs/auth/api', () => ({
  api_route: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('Lib: handleComments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Silencia o console.error para não poluir o terminal
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    const consoleError = console.error as jest.Mock;
    if (consoleError.mockRestore) {
        consoleError.mockRestore();
    }
  });

  describe('getComments', () => {
    it('deve chamar a rota correta e retornar os dados', async () => {
      const mockData = [{ id: 'c1', content: 'Legal' }];
      (api_route.get as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await getComments('post-123');

      expect(api_route.get).toHaveBeenCalledWith('/posts/post-123/comments');
      expect(result).toEqual(mockData);
    });

    it('deve logar erro e lançar exceção se a API falhar', async () => {
      const mockError = { message: 'Erro na API', response: { data: 'Detalhes' } };
      (api_route.get as jest.Mock).mockRejectedValue(mockError);

      await expect(getComments('post-123')).rejects.toEqual(mockError);

      expect(console.error).toHaveBeenCalledWith(
        'Erro ao puxar os comentários',
        'Detalhes'
      );
    });
  });

  describe('postComment', () => {
    it('deve enviar os dados corretos no body', async () => {
      const mockArgs = { postId: 'post-123', authorId: 'user-1', content: 'Novo comentário' };
      const mockResponse = { id: 'c2', ...mockArgs };
      
      (api_route.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await postComment(mockArgs);

      expect(api_route.post).toHaveBeenCalledWith(
        '/posts/post-123/comments',
        { authorId: 'user-1', content: 'Novo comentário' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('deve logar erro e lançar exceção ao falhar', async () => {
      const mockArgs = { postId: 'post-123', authorId: 'user-1', content: 'X' };
      const mockError = { message: 'Network Error' }; 
      
      (api_route.post as jest.Mock).mockRejectedValue(mockError);

      await expect(postComment(mockArgs)).rejects.toEqual(mockError);

      expect(console.error).toHaveBeenCalledWith(
        'Erro ao criar comentário',
        'Network Error'
      );
    });
  });
});