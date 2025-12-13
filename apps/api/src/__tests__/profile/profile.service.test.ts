import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import profileRepository from "../../modules/profile/profile.repository";
import cloudinary from "../../config/cloudinary";

const mockGroupFindUnique = jest.fn();
const mockGroupUpdate = jest.fn();

const mockPrisma = {
  group: {
    findUnique: mockGroupFindUnique,
    update: mockGroupUpdate,
  },
};

jest.doMock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

jest.mock("../../modules/profile/profile.repository");
jest.mock("../../config/cloudinary", () => ({
  uploader: {
    upload_stream: jest.fn(),
    destroy: jest.fn(),
  },
}));

// Isso garante que quando o serviço rodar "new PrismaClient()", o mock já esteja pronto.
const profileService = require("../../modules/profile/profile.service").default;

describe("ProfileService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchUserProfile", () => {
    it("should return the user profile and tabs data if user is found", async () => {
      const mockUserName = "user123";
      const mockAuthUserId = "auth-id";

      const mockProfile = {
        id: "user-id",
        userName: mockUserName,
        name: "User Name",
        email: "user@example.com",
        bio: "User Bio",
        profileImageUrl: "url",
        bannerImageUrl: "url",
        createdAt: new Date(),
        updatedAt: new Date(),
        followersCount: 10,
        followingCount: 5,
        groupsCount: 2,
        matchesCount: 1,
        isFollowing: false,
        isOwner: true,
      };

      const mockMatches = { matches: [{ id: "match-1" }] };
      const mockFollowedGroups = { groups: [{ id: "group-1" }] };
      const mockMemberGroups = { groups: [{ id: "group-2" }] };

      (profileRepository.findUserProfileByUserName as jest.Mock).mockResolvedValue(mockProfile);
      (profileRepository.findUserMatches as jest.Mock).mockResolvedValue(mockMatches);
      (profileRepository.findUserFollowedGroups as jest.Mock).mockResolvedValue(mockFollowedGroups);
      (profileRepository.findUserMemberGroups as jest.Mock).mockResolvedValue(mockMemberGroups);

      const result = await profileService.fetchUserProfile(mockUserName, mockAuthUserId);

      expect(result.profile.id).toEqual(mockProfile.id);
      expect(result.tabs.matches).toEqual(mockMatches.matches);
      expect(profileRepository.findUserProfileByUserName).toHaveBeenCalledWith(mockUserName, mockAuthUserId);
    });

    it("should throw ApiError(404) if user profile is not found", async () => {
      (profileRepository.findUserProfileByUserName as jest.Mock).mockResolvedValue(null);

      await expect(
        profileService.fetchUserProfile("non-existent")
      ).rejects.toEqual(new ApiError(httpStatus.NOT_FOUND, "Perfil de usuário não encontrado"));
    });
  });

  describe("fetchGroupProfile", () => {
    it("should return the group profile and tabs data if group is found", async () => {
      const mockGroupName = "group1";
      const mockProfile = {
        id: "group-id",
        name: mockGroupName,
      };

      const mockMembers = { members: [{ id: "member-1" }] };
      const mockPosts = { posts: [{ id: "post-1" }] };

      (profileRepository.findGroupProfileByName as jest.Mock).mockResolvedValue(mockProfile);
      (profileRepository.findGroupMembers as jest.Mock).mockResolvedValue(mockMembers);
      (profileRepository.findGroupPosts as jest.Mock).mockResolvedValue(mockPosts);

      const result = await profileService.fetchGroupProfile(mockGroupName);

      expect(result.profile).toEqual(mockProfile);
      expect(result.tabs.members).toEqual(mockMembers.members);
    });

    it("should throw ApiError(404) if group profile is not found", async () => {
      (profileRepository.findGroupProfileByName as jest.Mock).mockResolvedValue(null);

      await expect(
        profileService.fetchGroupProfile("non-existent")
      ).rejects.toEqual(new ApiError(httpStatus.NOT_FOUND, "Perfil de grupo não encontrado"));
    });
  });

  describe("updateGroupImages", () => {
    const mockFile = {
      buffer: Buffer.from("fake-buffer"),
    } as Express.Multer.File;

    it("should throw ApiError(404) if group does not exist", async () => {
      mockGroupFindUnique.mockResolvedValue(null);

      await expect(
        profileService.updateGroupImages("group-id", "user-id", mockFile)
      ).rejects.toEqual(new ApiError(httpStatus.NOT_FOUND, "Grupo não encontrado"));
    });

    it("should throw ApiError(403) if user is not admin or creator", async () => {
      mockGroupFindUnique.mockResolvedValue({
        id: "group-id",
        memberships: [],
      });

      await expect(
        profileService.updateGroupImages("group-id", "user-id", mockFile)
      ).rejects.toEqual(
        new ApiError(httpStatus.FORBIDDEN, "Você não tem permissão para editar este grupo")
      );
    });

    it("should upload new logo and update group", async () => {
      mockGroupFindUnique.mockResolvedValue({
        id: "group-id",
        memberships: [{ userId: "user-id", role: "ADMIN" }],
        logoId: null,
      });

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, { secure_url: "new-logo-url", public_id: "new-logo-id" });
          return { end: jest.fn() };
        }
      );

      const mockUpdatedGroup = { id: "group-id", logoUrl: "new-logo-url" };
      mockGroupUpdate.mockResolvedValue(mockUpdatedGroup);

      const result = await profileService.updateGroupImages("group-id", "user-id", mockFile, undefined);

      expect(result.group).toEqual(mockUpdatedGroup);
      expect(mockGroupUpdate).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ logoUrl: "new-logo-url" }),
      }));
    });

    it("should delete old banner and upload new banner", async () => {
      mockGroupFindUnique.mockResolvedValue({
        id: "group-id",
        memberships: [{ userId: "user-id", isCreator: true }],
        bannerId: "old-banner-id",
      });

      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({ result: "ok" });
      
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, { secure_url: "new-banner-url", public_id: "new-banner-id" });
          return { end: jest.fn() };
        }
      );

      const mockUpdatedGroup = { id: "group-id", bannerUrl: "new-banner-url" };
      mockGroupUpdate.mockResolvedValue(mockUpdatedGroup);

      const result = await profileService.updateGroupImages("group-id", "user-id", undefined, mockFile);

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("old-banner-id");
      expect(result.group).toEqual(mockUpdatedGroup);
    });
  });
});