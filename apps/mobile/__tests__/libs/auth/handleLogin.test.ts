import { handleLogin } from '@/libs/auth/handleLogin'; 
import { api_route } from '@/libs/auth/api';

// --- MOCKS ---

jest.mock('@/libs/auth/api', () => ({
  api_route: {
    post: jest.fn(),
  },
}));

describe('Lib: handleLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Silencia console.log para manter o output do teste limpo
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.log as jest.Mock).mockRestore();
  });

  it('deve retornar os dados do usuário e token em caso de sucesso', async () => {
    const mockResponse = {
      data: {
        token: 'token-123',
        user: { id: 'u1', name: 'User', email: 'u@u.com' }
      }
    };

    (api_route.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await handleLogin('email@teste.com', '123456');

    expect(api_route.post).toHaveBeenCalledWith('/login', {
      email: 'email@teste.com',
      password: '123456'
    });
    expect(result).toEqual(mockResponse.data);
  });

  describe('Tratamento de Erros', () => {
    it('deve lançar erro com mensagem do servidor (Objeto JSON padrão)', async () => {
      const errorObj = {
        response: {
          data: { message: 'Senha incorreta' }
        }
      };
      (api_route.post as jest.Mock).mockRejectedValue(errorObj);

      await expect(handleLogin('e', 'p')).rejects.toThrow('Senha incorreta');
    });

    it('deve lançar erro com mensagem do servidor (String JSON parseável)', async () => {
      // Seu código tenta fazer JSON.parse se for string
      const errorStr = {
        response: {
          data: JSON.stringify({ error: 'Usuário não encontrado' })
        }
      };
      (api_route.post as jest.Mock).mockRejectedValue(errorStr);

      await expect(handleLogin('e', 'p')).rejects.toThrow('Usuário não encontrado');
    });

    it('deve lançar erro com a própria string se não for JSON válido', async () => {
      const errorRaw = {
        response: {
          data: 'Erro Crítico' // String simples
        }
      };
      (api_route.post as jest.Mock).mockRejectedValue(errorRaw);

      // Seu código faz: data = { message: type_message } -> message: "Erro Crítico"
      await expect(handleLogin('e', 'p')).rejects.toThrow('Erro Crítico');
    });

    it('deve lançar erro genérico de conexão se não houver response', async () => {
      const errorNetwork = { request: {} }; // Sem 'response'
      (api_route.post as jest.Mock).mockRejectedValue(errorNetwork);

      await expect(handleLogin('e', 'p')).rejects.toThrow('Não foi possível conectar ao servidor');
    });
  });
});