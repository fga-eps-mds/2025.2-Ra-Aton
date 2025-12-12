import { getFeed } from '../../../libs/auth/handleFeed'; // Ajuste o caminho
import { api_route } from '@/libs/auth/api'; // Ajuste conforme o import original

// --- MOCKS ---

jest.mock('@/libs/auth/api', () => ({
  api_route: {
    get: jest.fn(),
  },
}));

describe('Lib: handleFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve buscar o feed com os parâmetros de paginação corretos', async () => {
    const mockResponse = { 
      data: [{ id: 1, title: 'Post' }], 
      meta: { page: 1, limit: 10 } 
    };
    
    (api_route.get as jest.Mock).mockResolvedValue({ data: mockResponse });

    const result = await getFeed({ page: 1, limit: 10 });

    expect(api_route.get).toHaveBeenCalledWith('/posts', {
      params: { page: '1', limit: '10' },
      signal: undefined
    });
    expect(result).toEqual(mockResponse);
  });

  it('deve passar o AbortSignal se fornecido', async () => {
    const controller = new AbortController();
    (api_route.get as jest.Mock).mockResolvedValue({ data: {} });

    await getFeed({ page: 1, limit: 10, signal: controller.signal });

    expect(api_route.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      signal: controller.signal
    }));
  });

  // Teste da lógica específica de erro do seu código
  it('NÃO deve lançar erro se o status for 400 (Bad Request)', async () => {
    const error400 = {
      response: { status: 400, data: 'Invalid page' }
    };
    
    (api_route.get as jest.Mock).mockRejectedValue(error400);

    // Não deve dar throw, deve retornar undefined
    const result = await getFeed({ page: -1, limit: 10 });
    
    expect(result).toBeUndefined();
  });

  it('DEVE lançar erro para outros status (ex: 500)', async () => {
    const error500 = {
      response: { status: 500, data: 'Server Error' }
    };
    
    (api_route.get as jest.Mock).mockRejectedValue(error500);

    await expect(getFeed({ page: 1, limit: 10 })).rejects.toEqual(error500);
  });
  it('DEVE lançar erro de rede se não houver resposta', async () => {
    const networkError = {
      request: {},
      response: undefined,
    };
    
    (api_route.get as jest.Mock).mockRejectedValue(networkError);

    await expect(getFeed({ page: 1, limit: 10 })).rejects.toEqual(networkError);
  });
  it('DEVE lançar erro inesperado para outros tipos de erro', async () => {
    const unexpectedError = new Error('Unexpected Error');
    
    (api_route.get as jest.Mock).mockRejectedValue(unexpectedError);

    await expect(getFeed({ page: 1, limit: 10 })).rejects.toEqual(unexpectedError);
  });
  it('deve converter parâmetros numéricos para strings na chamada da API', async () => {
    const mockResponse = { data: [] };
    
    (api_route.get as jest.Mock).mockResolvedValue({ data: mockResponse });

    const result = await getFeed({ page: 5, limit: 20 });

    expect(api_route.get).toHaveBeenCalledWith(
      '/posts',
      {
        params: {
          page: '5',
          limit: '20',
        },
        signal: undefined 
      },
    );

    expect(result).toEqual(mockResponse);
  });
});