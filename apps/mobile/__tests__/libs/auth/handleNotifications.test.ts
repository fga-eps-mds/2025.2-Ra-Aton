import { 
  getUserNotifications, 
  getUnreadNotificationsCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '@/libs/auth/handleNotifications';
import { api_route } from '@/libs/auth/api';

// --- MOCKS ---
jest.mock('@/libs/auth/api', () => ({
  api_route: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

describe('Lib: handleNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserNotifications', () => {
    it('deve buscar notificações e retornar a lista', async () => {
      const mockData = [{ id: '1', title: 'Teste' }];
      (api_route.get as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await getUserNotifications();

      expect(api_route.get).toHaveBeenCalledWith('/notifications');
      expect(result).toEqual(mockData);
    });
  });

  describe('getUnreadNotificationsCount', () => {
    it('deve buscar a contagem e retornar apenas o número', async () => {
      const mockResponse = { data: { count: 5 } };
      (api_route.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getUnreadNotificationsCount();

      expect(api_route.get).toHaveBeenCalledWith('/notifications/unread-count');
      expect(result).toBe(5);
    });
  });

  describe('markNotificationAsRead', () => {
    it('deve chamar PATCH na rota com ID', async () => {
      (api_route.patch as jest.Mock).mockResolvedValue({});

      await markNotificationAsRead('notif-123');

      expect(api_route.patch).toHaveBeenCalledWith('/notifications/notif-123/read');
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('deve chamar PATCH na rota geral', async () => {
      (api_route.patch as jest.Mock).mockResolvedValue({});

      await markAllNotificationsAsRead();

      expect(api_route.patch).toHaveBeenCalledWith('/notifications/read-all');
    });
  });
});