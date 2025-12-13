import { mockDeep } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";

const prismaMock = mockDeep<PrismaClient>();

jest.mock("@prisma/client", () => ({
  __esModule: true,
  PrismaClient: jest.fn().mockImplementation(() => prismaMock),
}));

import ProfileRepository from "../../modules/profile/profile.repository";

describe("ProfileRepository", () => {
  const mockDate = new Date();
  const authUserId = "auth-user-id-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findUserProfileByUserName", () => {
    const userName = "usuario_teste";
    const targetUserId = "target-user-id-456";

    it("deve retornar null se o usuário não for encontrado", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await ProfileRepository.findUserProfileByUserName(userName);

      expect(result).toBeNull();
    });

    it("deve retornar o perfil e verificar isFollowing = true", async () => {
      const mockUserResponse = {
        id: targetUserId,
        userName: userName,
        _count: { followers: 1, following: 1, GroupMembership: 1, subscription: 1 },
      };

      const mockFollow = {
        id: "follow-id",
        followerId: authUserId,
        followingId: targetUserId,
        createdAt: mockDate,
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUserResponse);
      prismaMock.userFollow.findUnique.mockResolvedValue(mockFollow);

      const result = await ProfileRepository.findUserProfileByUserName(userName, authUserId);

      expect(result).not.toBeNull();
      expect(result?.isFollowing).toBe(true);
    });

    it("deve identificar se o usuário é o dono do perfil (isOwner)", async () => {
      const mockUserResponse = {
        id: authUserId,
        userName: userName,
        _count: { followers: 0, following: 0, GroupMembership: 0, subscription: 0 },
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUserResponse);

      const result = await ProfileRepository.findUserProfileByUserName(userName, authUserId);

      expect(result?.isOwner).toBe(true);
    });
  });

  describe("findGroupPosts", () => {
    const groupId = "group-123";

    it("deve buscar posts do grupo com paginação e totalCount correto", async () => {
      const mockPosts = [
        {
          id: "post-1",
          title: "Post Título",
          groupId: groupId,
          createdAt: mockDate,
          updatedAt: mockDate,
          eventDate: null,
          eventFinishDate: null,
          author: { id: "a1", userName: "user1", name: "User 1" },
          likesCount: 0,
          commentsCount: 0,
          attendancesCount: 0,
          location: null,
          content: "Conteudo",
          type: "TEXT",
          authorId: "a1",
          reminderSent: false
        },
      ];

      prismaMock.post.findMany.mockResolvedValue(mockPosts);
      prismaMock.post.count.mockResolvedValue(1);

      const result = await (ProfileRepository as any).findGroupPosts(groupId, 10, 0);

      expect(result.posts[0].id).toBe("post-1");
      expect(result.totalCount).toBe(1);
    });
  });

  describe("findUserMatches", () => {
    it("deve listar as partidas/inscrições do usuário", async () => {
      const mockSubscriptions = [
        { 
            id: "sub-1",
            match: { 
                id: "match-1", 
                title: "Futebol Domingo",
                description: "Jogo amistoso",
                authorId: "admin-1",
                MatchDate: mockDate,
                MatchStatus: "EM_BREVE",
                maxPlayers: 22,
                location: "Quadra 1",
                sport: "FUTEBOL",
                createdAt: mockDate,
                updatedAt: mockDate,
                reminderSent: false,
                teamNameA: "Time A",
                teamNameB: "Time B",
                players: [
                    { 
                        team: "A", 
                        user: { id: "p1", name: "Jogador 1", userName: "jogador1" } 
                    },
                    { 
                        team: "B", 
                        user: { id: "p2", name: "Jogador 2", userName: "jogador2" } 
                    }
                ]
            } 
        },
      ];

      prismaMock.playerSubscription.findMany.mockResolvedValue(mockSubscriptions);
      prismaMock.playerSubscription.count.mockResolvedValue(1);

      const result = await ProfileRepository.findUserMatches(authUserId, 10, 0);

      expect(result.matches).toHaveLength(1);
      // @ts-expect-error - result.matchse[0] não será undefined
      expect(result.matches[0].title).toBe("Futebol Domingo");
      // @ts-expect-error - result.matchse[0] não será undefined
      expect(result.matches[0].createdAt).toBe(mockDate.toISOString());
      expect(result.totalCount).toBe(1);
    });
  });

  describe("findUserFollowedGroups", () => {
    it("deve listar grupos que o usuário segue", async () => {
        const mockFollowedGroups = [
            { 
                group: { 
                    id: "g1", 
                    name: "Grupo Seguido", 
                    description: "Desc",
                    logoUrl: "logo.jpg",
                    bannerUrl: "banner.jpg",
                    groupType: "AMATEUR",
                    sports: ["FUTEBOL"],
                    createdAt: mockDate,
                    updatedAt: mockDate,
                    bio: null,
                    logoId: null,
                    bannerId: null
                } 
            }
        ];

        prismaMock.groupFollow.findMany.mockResolvedValue(mockFollowedGroups);
        prismaMock.groupFollow.count.mockResolvedValue(1);

        const result = await ProfileRepository.findUserFollowedGroups(authUserId, 10, 0);

        expect(result.groups).toHaveLength(1);
        // @ts-expect-error - result.group[0] não será undefined
        expect(result.groups[0].name).toBe("Grupo Seguido");
        // @ts-expect-error - result.group[0] não será undefined
        expect(result.groups[0].sport).toBe("FUTEBOL");
    });
  });

  describe("findUserMemberGroups", () => {
    it("deve listar grupos onde o usuário é membro", async () => {
      const mockMemberships = [
        {
          group: {
            id: "g2",
            name: "Grupo Membro",
            description: "Desc",
            groupType: "AMATEUR",
            sports: ["FUTEBOL"],
            logoUrl: "logo.png",
            bannerUrl: "banner.png",
            createdAt: mockDate,
            updatedAt: mockDate,
            bio: null,
            logoId: null,
            bannerId: null,
            _count: { GroupMembership: 10 },
          },
        },
      ];

      prismaMock.groupMembership.findMany.mockResolvedValue(mockMemberships);
      prismaMock.groupMembership.count.mockResolvedValue(1);

      const result = await ProfileRepository.findUserMemberGroups(authUserId, 10, 0);

      // @ts-expect-error - result.group[0] não será undefined
      expect(result.groups[0].name).toBe("Grupo Membro");
      // @ts-expect-error - result.group[0] não será undefined
      expect(result.groups[0].sport).toBe("FUTEBOL");
      expect(result.totalCount).toBe(1);
    });
  });
});