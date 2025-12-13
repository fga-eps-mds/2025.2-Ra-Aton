import { Request, Response } from 'express';
import httpStatus from 'http-status';
import followController from '../../modules/follow/follow.controller';
import followService from '../../modules/follow/follow.service';
import groupRepository from '../../modules/group/group.repository';

jest.mock('../../modules/follow/follow.service', () => ({
  __esModule: true,
  default: {
    followGroup: jest.fn(),
    unfollowGroup: jest.fn(),
    getUserFollowingGroups: jest.fn(),
    followUser: jest.fn(),
    unfollowUser: jest.fn(),
  },
}));

jest.mock('../../modules/group/group.repository', () => ({
  __esModule: true,
  default: {
    findGroupByName: jest.fn(),
  },
}));

const mockedGroupRepo = groupRepository as jest.Mocked<typeof groupRepository>;
const mockedFollowService = followService as jest.Mocked<typeof followService>;

describe('FollowController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let sendMock: jest.Mock;

  const mockUserId = 'user-456';
  const mockGroupId = 'group-123';
  const mockGroupName = 'Atletica-CC';

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
    it('deve retornar 400 se o nome do grupo não for fornecido', async () => {
      req = {
        params: {},
        user: { id: mockUserId },
      } as any;

      await followController.followGroup(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: 'Nome do grupo é necessário' });
      expect(mockedGroupRepo.findGroupByName).not.toHaveBeenCalled();
    });

    it('deve retornar 404 se o grupo não for encontrado pelo nome', async () => {
      req = {
        params: { name: 'Grupo-Inexistente' },
        user: { id: mockUserId },
      } as any;

      mockedGroupRepo.findGroupByName.mockResolvedValue(null);

      await followController.followGroup(req as Request, res as Response);

      expect(mockedGroupRepo.findGroupByName).toHaveBeenCalledWith('Grupo-Inexistente');
      expect(mockedFollowService.followGroup).not.toHaveBeenCalled();
      
      expect(res.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: 'Grupo não encontrado' });
    });

    it('deve buscar o grupo pelo nome e chamar o serviço com o ID correto (201)', async () => {
      req = {
        params: { name: mockGroupName },
        user: { id: mockUserId },
      } as any;

      mockedGroupRepo.findGroupByName.mockResolvedValue({ id: mockGroupId, name: mockGroupName } as any);
      mockedFollowService.followGroup.mockResolvedValue(undefined);

      await followController.followGroup(req as Request, res as Response);

      expect(mockedGroupRepo.findGroupByName).toHaveBeenCalledWith(mockGroupName);
      expect(mockedFollowService.followGroup).toHaveBeenCalledWith(mockUserId, mockGroupId);
      
      expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({ message: 'Grupo seguido com sucesso' });
    });
  });

  describe('unfollowGroup', () => {
    it('deve retornar 400 se o nome do grupo não for fornecido', async () => {
      req = {
        params: {},
        user: { id: mockUserId },
      } as any;

      await followController.unfollowGroup(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: 'Nome do grupo é necessário' });
    });

    it('deve retornar 404 se o grupo não for encontrado ao tentar deixar de seguir', async () => {
      req = {
        params: { name: 'Grupo-Fantasma' },
        user: { id: mockUserId },
      } as any;

      mockedGroupRepo.findGroupByName.mockResolvedValue(null);

      await followController.unfollowGroup(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: 'Grupo não encontrado' });
      expect(mockedFollowService.unfollowGroup).not.toHaveBeenCalled();
    });

    it('deve buscar o grupo pelo nome e deixar de seguir (204)', async () => {
      req = {
        params: { name: mockGroupName },
        user: { id: mockUserId },
      } as any;

      mockedGroupRepo.findGroupByName.mockResolvedValue({ id: mockGroupId } as any);
      mockedFollowService.unfollowGroup.mockResolvedValue(undefined);

      await followController.unfollowGroup(req as Request, res as Response);

      expect(mockedGroupRepo.findGroupByName).toHaveBeenCalledWith(mockGroupName);
      expect(mockedFollowService.unfollowGroup).toHaveBeenCalledWith(mockUserId, mockGroupId);
      
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('listUserFollowing', () => {
    it('deve retornar 400 se o ID do usuário não for fornecido', async () => {
      req = {
        params: {},
        query: {},
      } as any;

      await followController.listUserFollowing(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: 'ID do usuário é necessário' });
    });

    it('deve usar valores padrão (limit=10, page=1) quando query não informada e retornar 200', async () => {
      const mockResult = {
        data: [],
        meta: { page: 1, limit: 10, totalCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false }
      };

      req = {
        params: { id: mockUserId },
        query: {},
      } as any;

      mockedFollowService.getUserFollowingGroups.mockResolvedValue(mockResult);

      await followController.listUserFollowing(req as Request, res as Response);

      expect(mockedFollowService.getUserFollowingGroups).toHaveBeenCalledWith(mockUserId, 10, 1);
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('deve retornar 200 com a lista de grupos usando parâmetros de paginação fornecidos', async () => {
      const mockResult = {
        data: [],
        meta: { page: 2, limit: 5, totalCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false }
      };

      req = {
        params: { id: mockUserId },
        query: { limit: '5', page: '2' },
      } as any;

      mockedFollowService.getUserFollowingGroups.mockResolvedValue(mockResult);

      await followController.listUserFollowing(req as Request, res as Response);

      expect(mockedFollowService.getUserFollowingGroups).toHaveBeenCalledWith(mockUserId, 5, 2);
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('followUser', () => {
    const followingId = 'user-789';

    it('deve retornar 400 se o ID do usuário não for fornecido', async () => {
      req = {
        params: {},
        user: { id: mockUserId },
      } as any;

      await followController.followUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: 'ID do usuário é necessário' });
      expect(mockedFollowService.followUser).not.toHaveBeenCalled();
    });

    it('deve seguir um usuário com sucesso (201)', async () => {
      req = {
        params: { userId: followingId },
        user: { id: mockUserId },
      } as any;

      mockedFollowService.followUser.mockResolvedValue(undefined);

      await followController.followUser(req as Request, res as Response);

      expect(mockedFollowService.followUser).toHaveBeenCalledWith(mockUserId, followingId);
      expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuário seguido com sucesso' });
    });

    it('deve propagar erro do serviço ao tentar seguir usuário', async () => {
      req = {
        params: { userId: followingId },
        user: { id: mockUserId },
      } as any;

      const mockError = new Error('Você não pode seguir a si mesmo');
      mockedFollowService.followUser.mockRejectedValue(mockError);

      await expect(
        followController.followUser(req as Request, res as Response)
      ).rejects.toThrow('Você não pode seguir a si mesmo');

      expect(mockedFollowService.followUser).toHaveBeenCalledWith(mockUserId, followingId);
    });
  });

  describe('unfollowUser', () => {
    const followingId = 'user-789';

    it('deve retornar 400 se o ID do usuário não for fornecido', async () => {
      req = {
        params: {},
        user: { id: mockUserId },
      } as any;

      await followController.unfollowUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: 'ID do usuário é necessário' });
      expect(mockedFollowService.unfollowUser).not.toHaveBeenCalled();
    });

    it('deve deixar de seguir um usuário com sucesso (204)', async () => {
      req = {
        params: { userId: followingId },
        user: { id: mockUserId },
      } as any;

      mockedFollowService.unfollowUser.mockResolvedValue(undefined);

      await followController.unfollowUser(req as Request, res as Response);

      expect(mockedFollowService.unfollowUser).toHaveBeenCalledWith(mockUserId, followingId);
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });

    it('deve propagar erro do serviço ao tentar deixar de seguir usuário', async () => {
      req = {
        params: { userId: followingId },
        user: { id: mockUserId },
      } as any;

      const mockError = new Error('Você não está seguindo este usuário');
      mockedFollowService.unfollowUser.mockRejectedValue(mockError);

      await expect(
        followController.unfollowUser(req as Request, res as Response)
      ).rejects.toThrow('Você não está seguindo este usuário');

      expect(mockedFollowService.unfollowUser).toHaveBeenCalledWith(mockUserId, followingId);
    });
  });
});