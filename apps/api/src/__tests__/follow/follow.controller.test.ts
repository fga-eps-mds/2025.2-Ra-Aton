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
    it('deve buscar o grupo pelo nome e chamar o serviço com o ID correto', async () => {
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
  });

  describe('unfollowGroup', () => {
    it('deve buscar o grupo pelo nome e deixar de seguir', async () => {
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
  });

  describe('listUserFollowing', () => {
    it('deve retornar 200 com a lista de grupos', async () => {
      const mockResult = {
        data: [],
        meta: { page: 1, limit: 10, totalCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false }
      };

      req = {
        params: { id: mockUserId },
        query: { limit: '10', page: '1' },
      } as any;

      mockedFollowService.getUserFollowingGroups.mockResolvedValue(mockResult);

      await followController.listUserFollowing(req as Request, res as Response);

      expect(mockedFollowService.getUserFollowingGroups).toHaveBeenCalledWith(mockUserId, 10, 1);
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });
});