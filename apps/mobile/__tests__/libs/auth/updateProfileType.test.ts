import { updateProfileType } from '@/libs/auth/updateProfileType'; 
import { api_route } from '@/libs/auth/api';

// --- MOCKS ---

// Mock do módulo da API
jest.mock('@/libs/auth/api', () => ({
  api_route: {
    patch: jest.fn(),
  },
}));

describe('Lib: updateProfileType', () => {
  const mockParams = {
    userName: 'user_test',
    profileType: 'ATLETICA',
    token: 'jwt-mock-token'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('deve chamar PATCH na rota correta com o token no header e os dados no body', async () => {
    const mockResponse = { message: 'Perfil atualizado' };
    (api_route.patch as jest.Mock).mockResolvedValue({ data: mockResponse });

    const result = await updateProfileType(mockParams);

    // 1. Verifica se PATCH foi chamado no endpoint correto
    expect(api_route.patch).toHaveBeenCalledWith(
      '/users/user_test', // URL
      { userName: 'user_test', profileType: 'ATLETICA' }, // Body
      { // Config (Headers)
        headers: {
          Authorization: 'Bearer jwt-mock-token',
        },
      },
    );
    
    // 2. Verifica o retorno
    expect(result).toEqual(mockResponse);
  });

  describe('Tratamento de Erros', () => {
    it('deve retornar objeto de erro se o servidor responder com status 4xx/5xx', async () => {
      const serverError = {
        response: {
          data: { error: 'Usuário não existe' },
        },
      };
      (api_route.patch as jest.Mock).mockRejectedValue(serverError);

      const result = await updateProfileType(mockParams);

      // Esperamos o objeto { error: '...' } definido no catch
      expect(result).toEqual({ error: 'Usuário não existe' });
    });

    it('deve retornar erro padrão se a resposta do servidor for genérica (sem campo "error")', async () => {
      const genericServerError = {
        response: {
          data: { message: 'Erro interno' }, // Sem campo 'error'
        },
      };
      (api_route.patch as jest.Mock).mockRejectedValue(genericServerError);

      const result = await updateProfileType(mockParams);

      // Esperamos a mensagem fallback do seu código
      expect(result).toEqual({ error: 'Erro ao atualizar [profileType].' });
    });


    it('deve lançar erro de conexão se a requisição não receber resposta (error.request)', async () => {
      const networkError = {
        request: {}, // Indica erro de rede/timeout
        response: undefined,
      };
      (api_route.patch as jest.Mock).mockRejectedValue(networkError);

      await expect(updateProfileType(mockParams)).rejects.toThrow('Não foi possível conectar ao servidor.');
      // CORREÇÃO: Verifica o primeiro argumento e ignora o segundo
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Sem resposta do servidor"),
        expect.anything() 
      );
    });

    it('deve lançar erro inesperado se o erro não for de response ou request', async () => {
      const unexpectedError = new Error('Erro de parsing');
      (api_route.patch as jest.Mock).mockRejectedValue(unexpectedError);

      await expect(updateProfileType(mockParams)).rejects.toThrow('Erro inesperado ao atualizar [profileType].');
      // CORREÇÃO: Verifica o primeiro argumento e ignora o segundo
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Erro ao registrar usuário"),
        expect.anything()
      );
    });
  });
});