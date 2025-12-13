import { 
  getMatchesFeed, 
  subscribeToMatch, 
  unsubscribeFromMatch, 
  getMatchById, 
  switchTeam 
} from '@/libs/auth/handleMatch'; // Ajuste se o nome do arquivo for handleMatches.ts
import { api_route } from '@/libs/auth/api';

// --- MOCKS ---

jest.mock('@/libs/auth/api', () => ({
  api_route: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Lib: handleMatch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMatchesFeed', () => {
    it('deve buscar o feed com paginação e sinal de aborto', async () => {
      const mockData = { data: [], meta: { page: 1 } };
      const controller = new AbortController();
      
      (api_route.get as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await getMatchesFeed({ 
        page: 1, 
        limit: 10, 
        signal: controller.signal 
      });

      expect(api_route.get).toHaveBeenCalledWith('/match', {
        params: { page: 1, limit: 10 },
        signal: controller.signal
      });
      expect(result).toEqual(mockData);
    });
  });

  describe('Ações de Partida', () => {
    it('subscribeToMatch deve fazer POST na rota correta', async () => {
      (api_route.post as jest.Mock).mockResolvedValue({});

      await subscribeToMatch('m1');

      expect(api_route.post).toHaveBeenCalledWith('/match/m1/subscribe');
    });

    it('unsubscribeFromMatch deve fazer DELETE na rota correta', async () => {
      (api_route.delete as jest.Mock).mockResolvedValue({});

      await unsubscribeFromMatch('m2');

      expect(api_route.delete).toHaveBeenCalledWith('/match/m2/unsubscribe');
    });

    it('switchTeam deve fazer POST na rota correta', async () => {
      (api_route.post as jest.Mock).mockResolvedValue({});

      await switchTeam('m3');

      expect(api_route.post).toHaveBeenCalledWith('/match/m3/switch');
    });

    it('getMatchById deve fazer GET e retornar os dados', async () => {
      const mockMatch = { id: 'm4', name: 'Jogo Final' };
      (api_route.get as jest.Mock).mockResolvedValue({ data: mockMatch });

      const result = await getMatchById('m4');

      expect(api_route.get).toHaveBeenCalledWith('/match/m4');
      expect(result).toEqual(mockMatch);
    });
  });
});