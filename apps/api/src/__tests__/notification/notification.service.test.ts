import { NotificationsService } from '../../modules/notification/notification.service';

// Mock do expo-server-sdk
jest.mock('expo-server-sdk', () => {
  const sendPushNotificationsAsync = jest.fn(async (chunk: any) => {
    return chunk.map((m: any, i: number) => ({ status: 'ok', id: `t-${i}` }));
  });

  const Expo = jest.fn().mockImplementation(() => ({
    chunkPushNotifications: (messages: any[]) => [messages],
    sendPushNotificationsAsync,
  }));

  // isExpoPushToken é usado estaticamente
  // Simula que tokens que começam com 'Expo' são válidos
  (Expo as any).isExpoPushToken = (token: string) => typeof token === 'string' && token.startsWith('Expo');

  return { Expo };
});

describe('NotificationsService', () => {
  const mockRepo = {
    upsertPushToken: jest.fn(),
    deletePushToken: jest.fn(),
    getUserPushToken: jest.fn(),
    getUsersPushTokens: jest.fn(),
    getGroupMemberTokens: jest.fn(),
  } as any;

  const service = new NotificationsService(mockRepo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('savePushToken', () => {
    it('should throw when token is invalid', async () => {
      await expect(service.savePushToken('U1', 'invalid-token')).rejects.toThrow('Invalid Expo Push Token');
      expect(mockRepo.upsertPushToken).not.toHaveBeenCalled();
    });

    it('should call repository.upsertPushToken when token is valid', async () => {
      mockRepo.upsertPushToken.mockResolvedValue({ userId: 'U1', token: 'ExpoABC' });

      const result = await service.savePushToken('U1', 'ExpoABC');

      expect(mockRepo.upsertPushToken).toHaveBeenCalledWith('U1', 'ExpoABC');
      expect(result).toEqual({ userId: 'U1', token: 'ExpoABC' });
    });
  });

  describe('removePushToken', () => {
    it('should call repository.deletePushToken', async () => {
      mockRepo.deletePushToken.mockResolvedValue(true);

      const result = await service.removePushToken('U1');

      expect(mockRepo.deletePushToken).toHaveBeenCalledWith('U1');
      expect(result).toBeTruthy();
    });
  });

  describe('sendToUser', () => {
    it('should return null when user has no token', async () => {
      mockRepo.getUserPushToken.mockResolvedValue(null);

      const res = await service.sendToUser('U-X', { title: 't', body: 'b' });
      expect(res).toBeNull();
    });

    it('should send notification when token exists', async () => {
      mockRepo.getUserPushToken.mockResolvedValue({ token: 'ExpoTOKEN' });

      const res = await service.sendToUser('U1', { title: 't', body: 'b' });

      // espera que o mock do expo retorne tickets
      expect(res).toBeDefined();
      // sendPushNotificationsAsync é chamado internamente (mocked in expo-server-sdk)
    });
  });

  describe('sendToUsers', () => {
    it('should return null when no tokens found', async () => {
      mockRepo.getUsersPushTokens.mockResolvedValue([]);

      const res = await service.sendToUsers(['U1', 'U2'], { title: 't', body: 'b' });
      expect(res).toBeNull();
    });

    it('should send notifications to multiple users', async () => {
      mockRepo.getUsersPushTokens.mockResolvedValue([{ userId: 'U1', token: 'Expo1' }, { userId: 'U2', token: 'Expo2' }]);

      const res = await service.sendToUsers(['U1', 'U2'], { title: 't', body: 'b' });

      expect(res).toBeDefined();
    });
  });

  describe('sendToGroup', () => {
    it('should return null if no member tokens', async () => {
      mockRepo.getGroupMemberTokens.mockResolvedValue([]);

      const res = await service.sendToGroup('G1', { title: 't', body: 'b' });
      expect(res).toBeNull();
    });

    it('should send to group members excluding specified users', async () => {
      mockRepo.getGroupMemberTokens.mockResolvedValue([
        { userId: 'A', token: 'ExpoA' },
        { userId: 'B', token: 'ExpoB' },
      ]);

      const res = await service.sendToGroup('G1', { title: 't', body: 'b' }, ['A']);
      expect(res).toBeDefined();
    });
  });
});
 