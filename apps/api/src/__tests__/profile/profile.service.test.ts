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

    it("should handle error when deleting old logo", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      mockGroupFindUnique.mockResolvedValue({
        id: "group-id",
        memberships: [{ userId: "user-id", role: "ADMIN" }],
        logoId: "old-logo-id",
      });

      (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(new Error("Delete failed"));

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, { secure_url: "new-logo-url", public_id: "new-logo-id" });
          return { end: jest.fn() };
        }
      );

      const mockUpdatedGroup = { id: "group-id", logoUrl: "new-logo-url" };
      mockGroupUpdate.mockResolvedValue(mockUpdatedGroup);

      const result = await profileService.updateGroupImages("group-id", "user-id", mockFile, undefined);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Erro ao deletar logo antigo:", expect.any(Error));
      expect(result.group).toEqual(mockUpdatedGroup);

      consoleErrorSpy.mockRestore();
    });

    it("should handle error when deleting old banner", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      mockGroupFindUnique.mockResolvedValue({
        id: "group-id",
        memberships: [{ userId: "user-id", isCreator: true }],
        bannerId: "old-banner-id",
      });

      (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(new Error("Delete failed"));

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, { secure_url: "new-banner-url", public_id: "new-banner-id" });
          return { end: jest.fn() };
        }
      );

      const mockUpdatedGroup = { id: "group-id", bannerUrl: "new-banner-url" };
      mockGroupUpdate.mockResolvedValue(mockUpdatedGroup);

      const result = await profileService.updateGroupImages("group-id", "user-id", undefined, mockFile);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Erro ao deletar banner antigo:", expect.any(Error));
      expect(result.group).toEqual(mockUpdatedGroup);

      consoleErrorSpy.mockRestore();
    });

    it("should update only bio without images", async () => {
      mockGroupFindUnique.mockResolvedValue({
        id: "group-id",
        memberships: [{ userId: "user-id", role: "ADMIN" }],
        logoId: null,
        bannerId: null,
      });

      const mockUpdatedGroup = { id: "group-id", bio: "Nova bio do grupo" };
      mockGroupUpdate.mockResolvedValue(mockUpdatedGroup);

      const result = await profileService.updateGroupImages(
        "group-id",
        "user-id",
        undefined,
        undefined,
        "Nova bio do grupo"
      );

      expect(result.group).toEqual(mockUpdatedGroup);
      expect(mockGroupUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { bio: "Nova bio do grupo" },
        })
      );
      expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
    });

    it("should not update bio with null value (due to condition check)", async () => {
      mockGroupFindUnique.mockResolvedValue({
        id: "group-id",
        memberships: [{ userId: "user-id", role: "ADMIN" }],
      });

      const mockUpdatedGroup = { id: "group-id" };
      mockGroupUpdate.mockResolvedValue(mockUpdatedGroup);

      const result = await profileService.updateGroupImages(
        "group-id",
        "user-id",
        undefined,
        undefined,
        null as any
      );

      expect(result.group).toEqual(mockUpdatedGroup);
      // Não deve chamar update com bio pois null não satisfaz a condição
      expect(mockGroupUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {},
        })
      );
    });

    it("should update bio with empty string", async () => {
      mockGroupFindUnique.mockResolvedValue({
        id: "group-id",
        memberships: [{ userId: "user-id", role: "ADMIN" }],
      });

      const mockUpdatedGroup = { id: "group-id", bio: "" };
      mockGroupUpdate.mockResolvedValue(mockUpdatedGroup);

      const result = await profileService.updateGroupImages(
        "group-id",
        "user-id",
        undefined,
        undefined,
        ""
      );

      expect(result.group).toEqual(mockUpdatedGroup);
      expect(mockGroupUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { bio: "" },
        })
      );
    });

    it("should upload both logo and banner together", async () => {
      mockGroupFindUnique.mockResolvedValue({
        id: "group-id",
        memberships: [{ userId: "user-id", role: "ADMIN" }],
        logoId: null,
        bannerId: null,
      });

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          const isLogo = options.folder.includes("logos");
          callback(null, {
            secure_url: isLogo ? "new-logo-url" : "new-banner-url",
            public_id: isLogo ? "new-logo-id" : "new-banner-id",
          });
          return { end: jest.fn() };
        }
      );

      const mockUpdatedGroup = { 
        id: "group-id", 
        logoUrl: "new-logo-url",
        bannerUrl: "new-banner-url" 
      };
      mockGroupUpdate.mockResolvedValue(mockUpdatedGroup);

      const result = await profileService.updateGroupImages(
        "group-id",
        "user-id",
        mockFile,
        mockFile,
        "Nova bio"
      );

      expect(result.group).toEqual(mockUpdatedGroup);
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledTimes(2);
    });

    it("should handle upload error for logo", async () => {
      mockGroupFindUnique.mockResolvedValue({
        id: "group-id",
        memberships: [{ userId: "user-id", role: "ADMIN" }],
        logoId: null,
      });

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(new Error("Upload failed"), null);
          return { end: jest.fn() };
        }
      );

      await expect(
        profileService.updateGroupImages("group-id", "user-id", mockFile, undefined)
      ).rejects.toThrow("Upload failed");
    });

    it("should handle upload error for banner", async () => {
      mockGroupFindUnique.mockResolvedValue({
        id: "group-id",
        memberships: [{ userId: "user-id", isCreator: true }],
        bannerId: null,
      });

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(new Error("Banner upload failed"), null);
          return { end: jest.fn() };
        }
      );

      await expect(
        profileService.updateGroupImages("group-id", "user-id", undefined, mockFile)
      ).rejects.toThrow("Banner upload failed");
    });
  });

  describe("updateUserImages", () => {
    const mockFile = {
      buffer: Buffer.from("fake-buffer"),
    } as Express.Multer.File;

    const mockUserFindUnique = jest.fn();
    const mockUserUpdate = jest.fn();

    beforeEach(() => {
      mockPrisma.user = {
        findUnique: mockUserFindUnique,
        update: mockUserUpdate,
      };
    });

    it("should throw ApiError(404) if user does not exist", async () => {
      mockUserFindUnique.mockResolvedValue(null);

      await expect(
        profileService.updateUserImages("user-id", "user-id", mockFile)
      ).rejects.toEqual(new ApiError(httpStatus.NOT_FOUND, "Usuário não encontrado"));
    });

    it("should throw ApiError(403) if trying to edit another user's profile", async () => {
      mockUserFindUnique.mockResolvedValue({
        id: "user-id",
      });

      await expect(
        profileService.updateUserImages("user-id", "other-user-id", mockFile)
      ).rejects.toEqual(
        new ApiError(httpStatus.FORBIDDEN, "Você só pode editar seu próprio perfil")
      );
    });

    it("should upload new profile image", async () => {
      mockUserFindUnique.mockResolvedValue({
        id: "user-id",
        profileImageId: null,
      });

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, { secure_url: "new-profile-url", public_id: "new-profile-id" });
          return { end: jest.fn() };
        }
      );

      const mockUpdatedUser = { id: "user-id", profileImageUrl: "new-profile-url" };
      mockUserUpdate.mockResolvedValue(mockUpdatedUser);

      const result = await profileService.updateUserImages("user-id", "user-id", mockFile, undefined);

      expect(result.user).toEqual(mockUpdatedUser);
      expect(mockUserUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ profileImageUrl: "new-profile-url" }),
        })
      );
    });

    it("should delete old profile image and upload new one", async () => {
      mockUserFindUnique.mockResolvedValue({
        id: "user-id",
        profileImageId: "old-profile-id",
      });

      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({ result: "ok" });

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, { secure_url: "new-profile-url", public_id: "new-profile-id" });
          return { end: jest.fn() };
        }
      );

      const mockUpdatedUser = { id: "user-id", profileImageUrl: "new-profile-url" };
      mockUserUpdate.mockResolvedValue(mockUpdatedUser);

      const result = await profileService.updateUserImages("user-id", "user-id", mockFile, undefined);

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("old-profile-id");
      expect(result.user).toEqual(mockUpdatedUser);
    });

    it("should handle error when deleting old profile image", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      mockUserFindUnique.mockResolvedValue({
        id: "user-id",
        profileImageId: "old-profile-id",
      });

      (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(new Error("Delete failed"));

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, { secure_url: "new-profile-url", public_id: "new-profile-id" });
          return { end: jest.fn() };
        }
      );

      const mockUpdatedUser = { id: "user-id", profileImageUrl: "new-profile-url" };
      mockUserUpdate.mockResolvedValue(mockUpdatedUser);

      const result = await profileService.updateUserImages("user-id", "user-id", mockFile, undefined);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Erro ao deletar imagem de perfil antiga:",
        expect.any(Error)
      );
      expect(result.user).toEqual(mockUpdatedUser);

      consoleErrorSpy.mockRestore();
    });

    it("should upload new banner image", async () => {
      mockUserFindUnique.mockResolvedValue({
        id: "user-id",
        bannerImageId: null,
      });

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, { secure_url: "new-banner-url", public_id: "new-banner-id" });
          return { end: jest.fn() };
        }
      );

      const mockUpdatedUser = { id: "user-id", bannerImageUrl: "new-banner-url" };
      mockUserUpdate.mockResolvedValue(mockUpdatedUser);

      const result = await profileService.updateUserImages("user-id", "user-id", undefined, mockFile);

      expect(result.user).toEqual(mockUpdatedUser);
      expect(mockUserUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ bannerImageUrl: "new-banner-url" }),
        })
      );
    });

    it("should delete old banner and upload new one", async () => {
      mockUserFindUnique.mockResolvedValue({
        id: "user-id",
        bannerImageId: "old-banner-id",
      });

      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({ result: "ok" });

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, { secure_url: "new-banner-url", public_id: "new-banner-id" });
          return { end: jest.fn() };
        }
      );

      const mockUpdatedUser = { id: "user-id", bannerImageUrl: "new-banner-url" };
      mockUserUpdate.mockResolvedValue(mockUpdatedUser);

      const result = await profileService.updateUserImages("user-id", "user-id", undefined, mockFile);

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("old-banner-id");
      expect(result.user).toEqual(mockUpdatedUser);
    });

    it("should handle error when deleting old banner", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      mockUserFindUnique.mockResolvedValue({
        id: "user-id",
        bannerImageId: "old-banner-id",
      });

      (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(new Error("Delete failed"));

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, { secure_url: "new-banner-url", public_id: "new-banner-id" });
          return { end: jest.fn() };
        }
      );

      const mockUpdatedUser = { id: "user-id", bannerImageUrl: "new-banner-url" };
      mockUserUpdate.mockResolvedValue(mockUpdatedUser);

      const result = await profileService.updateUserImages("user-id", "user-id", undefined, mockFile);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Erro ao deletar banner antigo:",
        expect.any(Error)
      );
      expect(result.user).toEqual(mockUpdatedUser);

      consoleErrorSpy.mockRestore();
    });

    it("should update only bio without images", async () => {
      mockUserFindUnique.mockResolvedValue({
        id: "user-id",
        profileImageId: null,
        bannerImageId: null,
      });

      const mockUpdatedUser = { id: "user-id", bio: "Nova bio do usuário" };
      mockUserUpdate.mockResolvedValue(mockUpdatedUser);

      const result = await profileService.updateUserImages(
        "user-id",
        "user-id",
        undefined,
        undefined,
        "Nova bio do usuário"
      );

      expect(result.user).toEqual(mockUpdatedUser);
      expect(mockUserUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { bio: "Nova bio do usuário" },
        })
      );
      expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
    });

    it("should not update bio with null value (due to condition check)", async () => {
      mockUserFindUnique.mockResolvedValue({
        id: "user-id",
      });

      const mockUpdatedUser = { id: "user-id" };
      mockUserUpdate.mockResolvedValue(mockUpdatedUser);

      const result = await profileService.updateUserImages(
        "user-id",
        "user-id",
        undefined,
        undefined,
        null as any
      );

      expect(result.user).toEqual(mockUpdatedUser);
      // Não deve chamar update com bio pois null não satisfaz a condição
      expect(mockUserUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {},
        })
      );
    });

    it("should update bio with empty string", async () => {
      mockUserFindUnique.mockResolvedValue({
        id: "user-id",
      });

      const mockUpdatedUser = { id: "user-id", bio: "" };
      mockUserUpdate.mockResolvedValue(mockUpdatedUser);

      const result = await profileService.updateUserImages(
        "user-id",
        "user-id",
        undefined,
        undefined,
        ""
      );

      expect(result.user).toEqual(mockUpdatedUser);
      expect(mockUserUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { bio: "" },
        })
      );
    });

    it("should upload both profile and banner together", async () => {
      mockUserFindUnique.mockResolvedValue({
        id: "user-id",
        profileImageId: null,
        bannerImageId: null,
      });

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          const isProfile = options.folder.includes("profiles");
          callback(null, {
            secure_url: isProfile ? "new-profile-url" : "new-banner-url",
            public_id: isProfile ? "new-profile-id" : "new-banner-id",
          });
          return { end: jest.fn() };
        }
      );

      const mockUpdatedUser = {
        id: "user-id",
        profileImageUrl: "new-profile-url",
        bannerImageUrl: "new-banner-url",
      };
      mockUserUpdate.mockResolvedValue(mockUpdatedUser);

      const result = await profileService.updateUserImages(
        "user-id",
        "user-id",
        mockFile,
        mockFile,
        "Nova bio"
      );

      expect(result.user).toEqual(mockUpdatedUser);
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledTimes(2);
    });

    it("should handle upload error for profile image", async () => {
      mockUserFindUnique.mockResolvedValue({
        id: "user-id",
        profileImageId: null,
      });

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(new Error("Profile upload failed"), null);
          return { end: jest.fn() };
        }
      );

      await expect(
        profileService.updateUserImages("user-id", "user-id", mockFile, undefined)
      ).rejects.toThrow("Profile upload failed");
    });

    it("should handle upload error for banner", async () => {
      mockUserFindUnique.mockResolvedValue({
        id: "user-id",
        bannerImageId: null,
      });

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(new Error("Banner upload failed"), null);
          return { end: jest.fn() };
        }
      );

      await expect(
        profileService.updateUserImages("user-id", "user-id", undefined, mockFile)
      ).rejects.toThrow("Banner upload failed");
    });
  });
});