import { api_route } from '@/libs/auth/api';
import {
  getUserProfile,
  getGroupProfile,
  followGroup,
  unfollowGroup,
} from '@/libs/auth/handleProfile';
import {
  IUserProfileResponse,
  IGroupProfileResponse,
} from '@/libs/interfaces/Iprofile';

jest.mock('@/libs/auth/api');

const mockedApi = api_route as jest.Mocked<typeof api_route>;

describe('handleProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('deve buscar o perfil de um usuário pelo userName', async () => {
      const mockUserProfile: IUserProfileResponse = {
        id: 'user-1',
        name: 'João Silva',
        userName: 'joaosilva',
        email: 'joao@example.com',
        profilePicture: 'https://example.com/avatar.jpg',
        bio: 'Desenvolvedor',
        followers: 10,
        following: 5,
        matches: [],
        followedGroups: [],
        memberGroups: [],
      };

      mockedApi.get.mockResolvedValue({ data: mockUserProfile });

      const result = await getUserProfile('joaosilva');

      expect(mockedApi.get).toHaveBeenCalledWith('/profile/user/joaosilva');
      expect(result).toEqual(mockUserProfile);
    });

    it('deve lançar erro quando a busca falhar', async () => {
      const error = new Error('User not found');
      mockedApi.get.mockRejectedValue(error);

      await expect(getUserProfile('invaliduser')).rejects.toThrow('User not found');
      expect(mockedApi.get).toHaveBeenCalledWith('/profile/user/invaliduser');
    });
  });

  describe('getGroupProfile', () => {
    it('deve buscar o perfil de um grupo pelo nome', async () => {
      const mockGroupProfile: IGroupProfileResponse = {
        id: 'group-1',
        name: 'Grupo Teste',
        description: 'Descrição do grupo',
        profilePicture: 'https://example.com/group.jpg',
        members: [],
        posts: [],
        followersCount: 15,
        isFollowing: false,
      };

      mockedApi.get.mockResolvedValue({ data: mockGroupProfile });

      const result = await getGroupProfile('Grupo Teste');

      expect(mockedApi.get).toHaveBeenCalledWith('/profile/group/Grupo Teste');
      expect(result).toEqual(mockGroupProfile);
    });

    it('deve lançar erro quando a busca falhar', async () => {
      const error = new Error('Group not found');
      mockedApi.get.mockRejectedValue(error);

      await expect(getGroupProfile('invalidgroup')).rejects.toThrow('Group not found');
      expect(mockedApi.get).toHaveBeenCalledWith('/profile/group/invalidgroup');
    });
  });

  describe('followGroup', () => {
    it('deve seguir um grupo com sucesso', async () => {
      const groupId = 'group-123';
      mockedApi.post.mockResolvedValue({ data: {} });

      await followGroup(groupId);

      expect(mockedApi.post).toHaveBeenCalledWith('/follow/groups/group-123/follow');
    });

    it('deve lançar erro quando seguir um grupo falhar', async () => {
      const groupId = 'group-123';
      const error = new Error('Already following');
      mockedApi.post.mockRejectedValue(error);

      await expect(followGroup(groupId)).rejects.toThrow('Already following');
      expect(mockedApi.post).toHaveBeenCalledWith('/follow/groups/group-123/follow');
    });
  });

  describe('unfollowGroup', () => {
    it('deve deixar de seguir um grupo com sucesso', async () => {
      const groupId = 'group-123';
      mockedApi.delete.mockResolvedValue({ data: {} });

      await unfollowGroup(groupId);

      expect(mockedApi.delete).toHaveBeenCalledWith('/follow/groups/group-123/follow');
    });

    it('deve lançar erro quando deixar de seguir um grupo falhar', async () => {
      const groupId = 'group-123';
      const error = new Error('Not following');
      mockedApi.delete.mockRejectedValue(error);

      await expect(unfollowGroup(groupId)).rejects.toThrow('Not following');
      expect(mockedApi.delete).toHaveBeenCalledWith('/follow/groups/group-123/follow');
    });
  });
});