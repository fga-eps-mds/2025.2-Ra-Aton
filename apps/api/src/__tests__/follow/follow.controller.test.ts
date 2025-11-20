import { Request, Response } from 'express';
import httpStatus from 'http-status';
import followController from '../../modules/follow/follow.controller';
import followService from '../../modules/follow/follow.service';

// Mock do serviço
jest.mock('../../modules/follow/follow.service');

describe('FollowController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    sendMock = jest.fn().mockReturnThis();

    res = {
      status: statusMock,
      json: jsonMock,
      send: sendMock,
    };
  });

  describe('followGroup', () => {
    it('deve retornar 201 ao seguir grupo', async () => {
      // Arrange
      req = {
        params: { id: 'group-123' },
        user: { id: 'user-456' },
      } as any;

      (followService.followGroup as jest.Mock).mockResolvedValue(undefined);

      // Act
      await followController.followGroup(req as Request, res as Response);

      // Assert
      expect(followService.followGroup).toHaveBeenCalledWith('user-456', 'group-123');
      expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({ message: 'Grupo seguido com sucesso' });
    });
  });

  describe('unfollowGroup', () => {
    it('deve retornar 204 ao deixar de seguir', async () => {
      // Arrange
      req = {
        params: { id: 'group-123' },
        user: { id: 'user-456' },
      } as any;

      (followService.unfollowGroup as jest.Mock).mockResolvedValue(undefined);

      // Act
      await followController.unfollowGroup(req as Request, res as Response);

      // Assert
      expect(followService.unfollowGroup).toHaveBeenCalledWith('user-456', 'group-123');
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('listUserFollowing', () => {
    it('deve retornar 200 com a lista de grupos', async () => {
      // Arrange
      const mockResult = {
        data: [],
        meta: { page: 1, limit: 10, totalCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false }
      };

      req = {
        params: { id: 'user-456' },
        query: { limit: '10', page: '1' },
      } as any;

      (followService.getUserFollowingGroups as jest.Mock).mockResolvedValue(mockResult);

      // Act
      await followController.listUserFollowing(req as Request, res as Response);

      // Assert
      expect(followService.getUserFollowingGroups).toHaveBeenCalledWith('user-456', 10, 1);
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('deve usar valores padrão para paginação', async () => {
      // Arrange
      req = {
        params: { id: 'user-456' },
        query: {}, // Sem limit/page
      } as any;

      // Act
      await followController.listUserFollowing(req as Request, res as Response);

      // Assert
      expect(followService.getUserFollowingGroups).toHaveBeenCalledWith('user-456', 10, 1); // Defaults
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    });
  });
});