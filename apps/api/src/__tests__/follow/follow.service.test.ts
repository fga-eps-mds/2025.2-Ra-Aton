import followService from '../../modules/follow/follow.service';
import followRepository from '../../modules/follow/follow.repository';
import groupRepository from '../../modules/group/group.repository';
import userFollowRepository from '../../modules/user/userFollow.repository';
import userRepository from '../../modules/user/user.repository';
import httpStatus from 'http-status';

jest.mock('../../modules/follow/follow.repository');
jest.mock('../../modules/group/group.repository');
jest.mock('../../modules/user/userFollow.repository');
jest.mock('../../modules/user/user.repository');

const mockedFollowRepo = followRepository as jest.Mocked<typeof followRepository>;
const mockedGroupRepo = groupRepository as jest.Mocked<typeof groupRepository>;
const mockedUserFollowRepo = userFollowRepository as jest.Mocked<typeof userFollowRepository>;
const mockedUserRepo = userRepository as jest.Mocked<typeof userRepository>;

describe('FollowService', () => {
  const userId = 'user-123';
  const groupId = 'group-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('followGroup', () => {
    it('deve seguir um grupo com sucesso', async () => {
      (mockedGroupRepo.findGroupById as jest.Mock).mockResolvedValue({ id: groupId });
      (mockedFollowRepo.findFollow as jest.Mock).mockResolvedValue(null);

      await followService.followGroup(userId, groupId);

      expect(mockedFollowRepo.createFollow).toHaveBeenCalledWith(userId, groupId);
    });

    it('deve lançar erro 404 se o grupo não existir', async () => {
      (mockedGroupRepo.findGroupById as jest.Mock).mockResolvedValue(null);

      await expect(followService.followGroup(userId, groupId))
        .rejects.toHaveProperty('statusCode', httpStatus.NOT_FOUND);
      
      expect(mockedFollowRepo.createFollow).not.toHaveBeenCalled();
    });

    it('deve lançar erro 409 se já seguir o grupo', async () => {
      (mockedGroupRepo.findGroupById as jest.Mock).mockResolvedValue({ id: groupId });
      (mockedFollowRepo.findFollow as jest.Mock).mockResolvedValue({ id: 'follow-1' });

      await expect(followService.followGroup(userId, groupId))
        .rejects.toHaveProperty('statusCode', httpStatus.CONFLICT);
      
      expect(mockedFollowRepo.createFollow).not.toHaveBeenCalled();
    });
  });

  describe('unfollowGroup', () => {
    it('deve deixar de seguir um grupo com sucesso', async () => {
      (mockedFollowRepo.findFollow as jest.Mock).mockResolvedValue({ id: 'follow-1' });

      await followService.unfollowGroup(userId, groupId);

      expect(mockedFollowRepo.deleteFollow).toHaveBeenCalledWith(userId, groupId);
    });

    it('deve lançar erro 400 se tentar deixar de seguir grupo que não segue', async () => {
      (mockedFollowRepo.findFollow as jest.Mock).mockResolvedValue(null);

      await expect(followService.unfollowGroup(userId, groupId))
        .rejects.toHaveProperty('statusCode', httpStatus.BAD_REQUEST);
      
      expect(mockedFollowRepo.deleteFollow).not.toHaveBeenCalled();
    });
  });

  describe('getUserFollowingGroups', () => {
    it('deve retornar lista paginada de grupos', async () => {
      const mockGroups = [{ id: 'g1', name: 'Grupo A' }];
      const mockResult = { groups: mockGroups, totalCount: 1 };
      
      (mockedFollowRepo.findGroupsFollowedByUser as jest.Mock).mockResolvedValue(mockResult);

      const result = await followService.getUserFollowingGroups(userId, 10, 1);

      expect(mockedFollowRepo.findGroupsFollowedByUser).toHaveBeenCalledWith(userId, 10, 0);
      expect(result.data).toEqual(mockGroups);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalCount).toBe(1);
    });

    it('deve calcular corretamente o offset para página 2', async () => {
      const mockGroups = [{ id: 'g2', name: 'Grupo B' }];
      const mockResult = { groups: mockGroups, totalCount: 25 };
      
      (mockedFollowRepo.findGroupsFollowedByUser as jest.Mock).mockResolvedValue(mockResult);

      const result = await followService.getUserFollowingGroups(userId, 10, 2);

      expect(mockedFollowRepo.findGroupsFollowedByUser).toHaveBeenCalledWith(userId, 10, 10);
      expect(result.meta.page).toBe(2);
      expect(result.meta.totalPages).toBe(3);
    });

    it('deve retornar hasNextPage true quando há mais páginas', async () => {
      const mockResult = { groups: [], totalCount: 30 };
      
      (mockedFollowRepo.findGroupsFollowedByUser as jest.Mock).mockResolvedValue(mockResult);

      const result = await followService.getUserFollowingGroups(userId, 10, 1);

      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(false);
    });

    it('deve retornar hasNextPage false na última página', async () => {
      const mockResult = { groups: [], totalCount: 25 };
      
      (mockedFollowRepo.findGroupsFollowedByUser as jest.Mock).mockResolvedValue(mockResult);

      const result = await followService.getUserFollowingGroups(userId, 10, 3);

      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPreviousPage).toBe(true);
    });

    it('deve retornar hasPreviousPage true quando não está na primeira página', async () => {
      const mockResult = { groups: [], totalCount: 50 };
      
      (mockedFollowRepo.findGroupsFollowedByUser as jest.Mock).mockResolvedValue(mockResult);

      const result = await followService.getUserFollowingGroups(userId, 10, 2);

      expect(result.meta.hasPreviousPage).toBe(true);
    });

    it('deve retornar array vazio quando não há grupos', async () => {
      const mockResult = { groups: [], totalCount: 0 };
      
      (mockedFollowRepo.findGroupsFollowedByUser as jest.Mock).mockResolvedValue(mockResult);

      const result = await followService.getUserFollowingGroups(userId, 10, 1);

      expect(result.data).toEqual([]);
      expect(result.meta.totalCount).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });
  });

  describe('followUser', () => {
    const followerId = 'user-123';
    const followingId = 'user-456';

    it('deve seguir um usuário com sucesso', async () => {
      (mockedUserRepo.findById as jest.Mock).mockResolvedValue({ id: followingId });
      (mockedUserFollowRepo.findFollow as jest.Mock).mockResolvedValue(null);

      await followService.followUser(followerId, followingId);

      expect(mockedUserFollowRepo.createFollow).toHaveBeenCalledWith(followerId, followingId);
    });

    it('deve lançar erro 400 se tentar seguir a si mesmo', async () => {
      await expect(followService.followUser(followerId, followerId))
        .rejects.toHaveProperty('statusCode', httpStatus.BAD_REQUEST);
      
      expect(mockedUserRepo.findById).not.toHaveBeenCalled();
      expect(mockedUserFollowRepo.createFollow).not.toHaveBeenCalled();
    });

    it('deve verificar mensagem de erro ao tentar seguir a si mesmo', async () => {
      await expect(followService.followUser(followerId, followerId))
        .rejects.toHaveProperty('message', 'Você não pode seguir a si mesmo');
    });

    it('deve lançar erro 404 se o usuário a ser seguido não existir', async () => {
      (mockedUserRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(followService.followUser(followerId, followingId))
        .rejects.toHaveProperty('statusCode', httpStatus.NOT_FOUND);
      
      expect(mockedUserFollowRepo.createFollow).not.toHaveBeenCalled();
    });

    it('deve verificar mensagem de erro quando usuário não existe', async () => {
      (mockedUserRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(followService.followUser(followerId, followingId))
        .rejects.toHaveProperty('message', 'Usuário não encontrado');
    });

    it('deve lançar erro 409 se já seguir o usuário', async () => {
      (mockedUserRepo.findById as jest.Mock).mockResolvedValue({ id: followingId });
      (mockedUserFollowRepo.findFollow as jest.Mock).mockResolvedValue({ id: 'follow-1' });

      await expect(followService.followUser(followerId, followingId))
        .rejects.toHaveProperty('statusCode', httpStatus.CONFLICT);
      
      expect(mockedUserFollowRepo.createFollow).not.toHaveBeenCalled();
    });

    it('deve verificar mensagem de erro quando já segue o usuário', async () => {
      (mockedUserRepo.findById as jest.Mock).mockResolvedValue({ id: followingId });
      (mockedUserFollowRepo.findFollow as jest.Mock).mockResolvedValue({ id: 'follow-1' });

      await expect(followService.followUser(followerId, followingId))
        .rejects.toHaveProperty('message', 'Você já está seguindo este usuário');
    });
  });

  describe('unfollowUser', () => {
    const followerId = 'user-123';
    const followingId = 'user-456';

    it('deve deixar de seguir um usuário com sucesso', async () => {
      (mockedUserFollowRepo.findFollow as jest.Mock).mockResolvedValue({ id: 'follow-1' });

      await followService.unfollowUser(followerId, followingId);

      expect(mockedUserFollowRepo.deleteFollow).toHaveBeenCalledWith(followerId, followingId);
    });

    it('deve lançar erro 400 se tentar deixar de seguir usuário que não segue', async () => {
      (mockedUserFollowRepo.findFollow as jest.Mock).mockResolvedValue(null);

      await expect(followService.unfollowUser(followerId, followingId))
        .rejects.toHaveProperty('statusCode', httpStatus.BAD_REQUEST);
      
      expect(mockedUserFollowRepo.deleteFollow).not.toHaveBeenCalled();
    });

    it('deve verificar mensagem de erro quando não segue o usuário', async () => {
      (mockedUserFollowRepo.findFollow as jest.Mock).mockResolvedValue(null);

      await expect(followService.unfollowUser(followerId, followingId))
        .rejects.toHaveProperty('message', 'Você não está seguindo este usuário');
    });
  });
});