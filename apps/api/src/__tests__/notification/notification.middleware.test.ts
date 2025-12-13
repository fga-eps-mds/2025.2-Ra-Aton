import { Request, Response, NextFunction } from 'express';

// Declara os mocks antes de qualquer import que os use
const mockSendToGroup = jest.fn();
const mockSendToUser = jest.fn();

// Mock do módulo de notification.service antes de importar o middleware
jest.mock('../../modules/notification/notification.service', () => {
  return {
    NotificationsService: jest.fn().mockImplementation(() => ({
      sendToGroup: mockSendToGroup,
      sendToUser: mockSendToUser,
    })),
  };
});

jest.mock('../../modules/notification/notification.repository');
jest.mock('../../database/prisma.client');

// Agora importa o middleware após os mocks estarem configurados
import { notifyGroupMembers, notifyUser } from '../../middlewares/notificationMiddleware';

describe('Notification Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
    };
    mockResponse = {
      locals: {},
    };
    mockNext = jest.fn();
    
    // Spy nos console.log e console.error
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Limpa mocks
    jest.clearAllMocks();
    mockSendToGroup.mockClear();
    mockSendToUser.mockClear();
    mockSendToGroup.mockResolvedValue(undefined);
    mockSendToUser.mockResolvedValue(undefined);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('notifyGroupMembers', () => {
    it('should send notification to group members successfully', async () => {
      const config = {
        getGroupId: (req: Request, res: Response) => 'group-123',
        getTitle: (req: Request, res: Response) => 'Test Title',
        getBody: (req: Request, res: Response) => 'Test Body',
        getData: (req: Request, res: Response) => ({ key: 'value' }),
        excludeUserId: (req: Request) => 'user-456',
      };

      const middleware = notifyGroupMembers(config);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Notificação enviada para membros do grupo group-123');
    });

    it('should not send notification if groupId is not provided', async () => {
      const config = {
        getGroupId: (req: Request, res: Response) => '',
        getTitle: (req: Request, res: Response) => 'Test Title',
        getBody: (req: Request, res: Response) => 'Test Body',
      };

      const middleware = notifyGroupMembers(config);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockSendToGroup).not.toHaveBeenCalled();
    });

    it('should send notification without excludeUserId if not provided', async () => {
      const config = {
        getGroupId: (req: Request, res: Response) => 'group-123',
        getTitle: (req: Request, res: Response) => 'Test Title',
        getBody: (req: Request, res: Response) => 'Test Body',
      };

      const middleware = notifyGroupMembers(config);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Notificação enviada para membros do grupo group-123');
    });

    it('should send notification without data if not provided', async () => {
      const config = {
        getGroupId: (req: Request, res: Response) => 'group-123',
        getTitle: (req: Request, res: Response) => 'Test Title',
        getBody: (req: Request, res: Response) => 'Test Body',
      };

      const middleware = notifyGroupMembers(config);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Notificação enviada para membros do grupo group-123');
    });

    it('should handle error when sending notification to group fails', async () => {
      const mockError = new Error('Failed to send notification');
      mockSendToGroup.mockRejectedValue(mockError);

      const config = {
        getGroupId: (req: Request, res: Response) => 'group-123',
        getTitle: (req: Request, res: Response) => 'Test Title',
        getBody: (req: Request, res: Response) => 'Test Body',
      };

      const middleware = notifyGroupMembers(config);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Aguarda a execução assíncrona e o catch
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockNext).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Erro ao enviar notificação para grupo:', mockError);
    });

    it('should call next even if config throws error', async () => {
      const config = {
        getGroupId: (req: Request, res: Response) => {
          throw new Error('Config error');
        },
        getTitle: (req: Request, res: Response) => 'Test Title',
        getBody: (req: Request, res: Response) => 'Test Body',
      };

      const middleware = notifyGroupMembers(config);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Erro no middleware de notificação de grupo:',
        expect.any(Error)
      );
    });

    it('should handle excludeUserId returning undefined', async () => {
      const config = {
        getGroupId: (req: Request, res: Response) => 'group-123',
        getTitle: (req: Request, res: Response) => 'Test Title',
        getBody: (req: Request, res: Response) => 'Test Body',
        excludeUserId: (req: Request) => undefined,
      };

      const middleware = notifyGroupMembers(config);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Notificação enviada para membros do grupo group-123');
    });
  });

  describe('notifyUser', () => {
    it('should send notification to user successfully', async () => {
      const config = {
        getUserId: (req: Request, res: Response) => 'user-123',
        getTitle: (req: Request, res: Response) => 'User Title',
        getBody: (req: Request, res: Response) => 'User Body',
        getData: (req: Request, res: Response) => ({ type: 'test' }),
      };

      const middleware = notifyUser(config);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Notificação enviada para usuário user-123');
    });

    it('should not send notification if userId is not provided', async () => {
      const config = {
        getUserId: (req: Request, res: Response) => '',
        getTitle: (req: Request, res: Response) => 'User Title',
        getBody: (req: Request, res: Response) => 'User Body',
      };

      const middleware = notifyUser(config);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockSendToUser).not.toHaveBeenCalled();
    });

    it('should send notification without data if not provided', async () => {
      const config = {
        getUserId: (req: Request, res: Response) => 'user-123',
        getTitle: (req: Request, res: Response) => 'User Title',
        getBody: (req: Request, res: Response) => 'User Body',
      };

      const middleware = notifyUser(config);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Notificação enviada para usuário user-123');
    });

    it('should handle error when sending notification to user fails', async () => {
      const mockError = new Error('Failed to send user notification');
      mockSendToUser.mockRejectedValue(mockError);

      const config = {
        getUserId: (req: Request, res: Response) => 'user-123',
        getTitle: (req: Request, res: Response) => 'User Title',
        getBody: (req: Request, res: Response) => 'User Body',
      };

      const middleware = notifyUser(config);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Aguarda a execução assíncrona e o catch
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockNext).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Erro ao enviar notificação para usuário:', mockError);
    });

    it('should call next even if config throws error', async () => {
      const config = {
        getUserId: (req: Request, res: Response) => {
          throw new Error('Config error in user notification');
        },
        getTitle: (req: Request, res: Response) => 'User Title',
        getBody: (req: Request, res: Response) => 'User Body',
      };

      const middleware = notifyUser(config);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Erro no middleware de notificação:',
        expect.any(Error)
      );
    });

    it('should read values from res.locals', async () => {
      mockResponse.locals = {
        userId: 'user-from-locals',
        title: 'Title from locals',
        body: 'Body from locals',
      };

      const config = {
        getUserId: (req: Request, res: Response) => res.locals!.userId,
        getTitle: (req: Request, res: Response) => res.locals!.title,
        getBody: (req: Request, res: Response) => res.locals!.body,
      };

      const middleware = notifyUser(config);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Notificação enviada para usuário user-from-locals');
    });

    it('should read values from req.body', async () => {
      mockRequest.body = {
        targetUserId: 'user-from-body',
      };

      const config = {
        getUserId: (req: Request, res: Response) => req.body.targetUserId,
        getTitle: (req: Request, res: Response) => 'Body Title',
        getBody: (req: Request, res: Response) => 'Body Content',
      };

      const middleware = notifyUser(config);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Notificação enviada para usuário user-from-body');
    });
  });
});
