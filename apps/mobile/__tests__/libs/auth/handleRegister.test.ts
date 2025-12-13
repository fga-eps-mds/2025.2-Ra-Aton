import { registerUser } from '@/libs/auth/handleRegister'; // Ajuste se o nome do arquivo for diferente
import { api_route } from '@/libs/auth/api';

// --- MOCKS ---
jest.mock('@/libs/auth/api', () => ({
  api_route: {
    post: jest.fn(),
  },
}));

describe('Lib: handleRegistes', () => {
  const mockParams = {
    name: 'User Test',
    userName: 'usertest',
    email: 'test@email.com',
    password: '123'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve registrar usuário com sucesso', async () => {
    const mockResponse = { id: 'u1', name: 'User Test' };
    (api_route.post as jest.Mock).mockResolvedValue({ data: mockResponse });

    const result = await registerUser(mockParams);

    expect(api_route.post).toHaveBeenCalledWith('/users', mockParams);
    expect(result).toEqual(mockResponse);
  });

  it('deve retornar objeto vazio se response.data for null/undefined', async () => {
    (api_route.post as jest.Mock).mockResolvedValue({ data: null });

    const result = await registerUser(mockParams);

    expect(result).toEqual({});
  });

  describe('Tratamento de Erros', () => {
    it('deve lançar erro vindo de objeto JSON padrão', async () => {
      const errorObj = {
        response: {
          data: { message: 'Email já cadastrado' }
        }
      };
      (api_route.post as jest.Mock).mockRejectedValue(errorObj);

      await expect(registerUser(mockParams)).rejects.toThrow('Email já cadastrado');
    });

    it('deve lançar erro vindo de String JSON (parseável)', async () => {
      // O backend às vezes retorna uma string que é um JSON
      const errorStrJson = {
        response: {
          data: JSON.stringify({ error: 'Username inválido' })
        }
      };
      (api_route.post as jest.Mock).mockRejectedValue(errorStrJson);

      await expect(registerUser(mockParams)).rejects.toThrow('Username inválido');
    });

    it('deve lançar erro vindo de String Simples (não parseável)', async () => {
      const errorStrRaw = {
        response: {
          data: 'Erro interno fatal' // String pura
        }
      };
      (api_route.post as jest.Mock).mockRejectedValue(errorStrRaw);

      // O código faz: data = { message: raw }
      await expect(registerUser(mockParams)).rejects.toThrow('Erro interno fatal');
    });

    it('deve lançar erro padrão se falhar a conexão (sem response)', async () => {
      const errorNetwork = { request: {} }; // Sem response
      (api_route.post as jest.Mock).mockRejectedValue(errorNetwork);

      await expect(registerUser(mockParams)).rejects.toThrow('Não foi possível conectar ao servidor');
    });
  });
});