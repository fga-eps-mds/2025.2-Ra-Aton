import { syncPushToken, removePushToken } from '@/libs/notifications/syncPushToken';
import { api_route } from '@/libs/auth/api';

// --- MOCKS ---

jest.mock('@/libs/auth/api', () => ({
  api_route: {
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Service: syncPushToken', () => {
  const mockPost = api_route.post as jest.Mock;
  const mockDelete = api_route.delete as jest.Mock;
  const mockToken = 'mock-jwt-token';
  const mockExpoToken = 'mock-expo-push-token';
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  // --- Testes para syncPushToken ---

  describe('syncPushToken', () => {
    it('deve chamar api_route.post com token e header corretos e retornar true no sucesso', async () => {
      mockPost.mockResolvedValue({});

      const result = await syncPushToken(mockExpoToken, mockToken);

      expect(result).toBe(true);
      expect(mockPost).toHaveBeenCalledWith(
        '/notifications/token',
        { token: mockExpoToken },
        { headers: { Authorization: `Bearer ${mockToken}` } },
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Push token sincronizado com sucesso');
    });

    it('deve retornar false e logar erro se a chamada POST falhar', async () => {
      const mockError = new Error('401 Unauthorized');
      mockPost.mockRejectedValue(mockError);

      const result = await syncPushToken(mockExpoToken, mockToken);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Erro ao sincronizar push token:',
        '401 Unauthorized',
      );
    });

    it('deve retornar false e logar erro desconhecido se for lancado', async () => {
        mockPost.mockRejectedValue('unknown reason');
  
        const result = await syncPushToken(mockExpoToken, mockToken);
  
        expect(result).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '❌ Erro ao sincronizar push token:',
          'Erro desconhecido',
        );
      });
  });

  // --- Testes para removePushToken ---

  describe('removePushToken', () => {
    it('deve chamar api_route.delete com header correto e retornar true no sucesso', async () => {
      mockDelete.mockResolvedValue({});

      const result = await removePushToken(mockToken);

      expect(result).toBe(true);
      expect(mockDelete).toHaveBeenCalledWith('/notifications/token', {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Push token removido com sucesso');
    });

    it('deve retornar false e logar erro se a chamada DELETE falhar', async () => {
      const mockError = new Error('500 Server Error');
      mockDelete.mockRejectedValue(mockError);

      const result = await removePushToken(mockToken);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Erro ao remover push token:',
        '500 Server Error',
      );
    });
  });
});