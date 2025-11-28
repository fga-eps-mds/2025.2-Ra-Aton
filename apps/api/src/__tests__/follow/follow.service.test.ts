import followService from '../../modules/follow/follow.service';
import followRepository from '../../modules/follow/follow.repository';
import groupRepository from '../../modules/group/group.repository';
import httpStatus from 'http-status';

jest.mock('../../modules/follow/follow.repository');
jest.mock('../../modules/group/group.repository');

const mockedFollowRepo = followRepository as jest.Mocked<typeof followRepository>;
const mockedGroupRepo = groupRepository as jest.Mocked<typeof groupRepository>;

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
  });
});