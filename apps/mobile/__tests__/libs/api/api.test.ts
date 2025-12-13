import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- SETUP DOS MOCKS ---

// Mock do Config
jest.mock('@/libs/config/env', () => ({
  config: { apiUrl: 'http://test-api.com' },
  logConfig: jest.fn(),
}));

// Mock do AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}), { virtual: true });

// Mock do Axios
const mockRequestUse = jest.fn();
const mockResponseUse = jest.fn();
const mockCreate = jest.fn(() => ({
  interceptors: {
    request: { use: mockRequestUse },
    response: { use: mockResponseUse },
  },
  defaults: { headers: { common: {} } },
}));

jest.mock('axios', () => ({
  create: mockCreate,
}));

describe('Lib: API Client', () => {
  let api: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // RE-IMPORTAÇÃO ISOLADA (O Segredo!)
    // Isso força o arquivo api.ts a ser executado novamente, chamando axios.create e .use
    jest.isolateModules(() => {
      api = require('@/libs/api/api').default;
    });
  });

  afterEach(() => {
    const consoleError = console.error as jest.Mock;
    if (consoleError.mockRestore) {
        consoleError.mockRestore();
    }
  });

  it('deve criar a instância do axios com a configuração correta', () => {
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: 'http://test-api.com',
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    }));
  });

  describe('Request Interceptor', () => {
    it('deve adicionar o token Bearer ao header se existir no Storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('meu-token-secreto');

      // Agora mockRequestUse deve ter sido chamado
      const requestInterceptor = mockRequestUse.mock.calls[0][0];
      const configMock = { headers: {} };
      
      const resultConfig = await requestInterceptor(configMock);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@token');
      expect(resultConfig.headers.Authorization).toBe('Bearer meu-token-secreto');
    });

    it('NÃO deve adicionar Authorization se não houver token', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const requestInterceptor = mockRequestUse.mock.calls[0][0];
      const configMock = { headers: {} };

      const resultConfig = await requestInterceptor(configMock);

      expect(resultConfig.headers.Authorization).toBeUndefined();
    });

    it('deve rejeitar a promise em caso de erro no request', () => {
      const requestErrorInterceptor = mockRequestUse.mock.calls[0][1];
      const error = new Error('Request fail');

      return expect(requestErrorInterceptor(error)).rejects.toThrow('Request fail');
    });
  });

  describe('Response Interceptor', () => {
    it('deve retornar a resposta normalmente em caso de sucesso', async () => {
      const responseInterceptor = mockResponseUse.mock.calls[0][0];
      const responseMock = { data: 'sucesso' };

      const result = await responseInterceptor(responseMock);
      expect(result).toEqual(responseMock);
    });

    it('deve logar erro de Timeout (ECONNABORTED)', async () => {
      const errorInterceptor = mockResponseUse.mock.calls[0][1];
      const errorMock = { code: 'ECONNABORTED' };

      await expect(errorInterceptor(errorMock)).rejects.toEqual(errorMock);
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Timeout'));
    });

    it('deve logar erro de Rede (Network Error)', async () => {
      const errorInterceptor = mockResponseUse.mock.calls[0][1];
      const errorMock = { message: 'Network Error' };

      await expect(errorInterceptor(errorMock)).rejects.toEqual(errorMock);
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Erro de rede'));
    });

    it('deve apenas rejeitar outros erros sem logs específicos', async () => {
      const errorInterceptor = mockResponseUse.mock.calls[0][1];
      const errorMock = { message: 'Generic Error', code: 500 };

      await expect(errorInterceptor(errorMock)).rejects.toEqual(errorMock);
      expect(console.error).not.toHaveBeenCalled();
    });
  });
});