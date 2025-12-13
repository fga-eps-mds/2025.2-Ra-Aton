import { userService } from "../../modules/user/user.service";
import userRepository from "../../modules/user/user.repository";
import { uploadService } from "../../modules/user/upload.service";
import bcrypt from "bcryptjs";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

jest.mock("../../modules/user/user.repository");
jest.mock("../../modules/user/upload.service");

const repo = jest.mocked(userRepository);
const uploadMock = jest.mocked(uploadService);

describe("UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    const mockUserInput = {
      name: "Test User",
      userName: "testuser",
      email: "test@example.com",
      password: "testpassword",
    };

    it("should create a user successfully", async () => {
      jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedPassword" as any);
      repo.findByEmail.mockResolvedValue(null);
      repo.findByUserName.mockResolvedValue(null);

      const now = new Date();
      repo.create.mockResolvedValue({
        id: "u_1",
        ...mockUserInput,
        profileType: null,
        passwordHash: "hashedPassword",
        createdAt: now,
        updatedAt: now,
        notificationsAllowed: true,
        bio: null,
        profileImageUrl: null,
        bannerImageUrl: null,
        profileImageId: null,
        bannerImageId: null,
      });

      const result = await userService.createUser(mockUserInput);

      expect(repo.findByEmail).toHaveBeenCalledWith(mockUserInput.email);
      expect(repo.findByUserName).toHaveBeenCalledWith(mockUserInput.userName);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockUserInput.password, 10);
      expect(repo.create).toHaveBeenCalledTimes(1);
      
      expect((result as any).passwordHash).toBeUndefined();
      expect(result.name).toBe(mockUserInput.name);
    });

    it("should throw CONFLICT if email already exists", async () => {
      repo.findByEmail.mockResolvedValue({ id: "existing" } as any);

      await expect(userService.createUser(mockUserInput)).rejects.toThrow(
        new ApiError(httpStatus.CONFLICT, "Email já cadastrado")
      );
      
      expect(repo.create).not.toHaveBeenCalled();
    });

    it("should throw CONFLICT if username already exists", async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.findByUserName.mockResolvedValue({ id: "existing" } as any);

      await expect(userService.createUser(mockUserInput)).rejects.toThrow(
        new ApiError(httpStatus.CONFLICT, "Nome de usuário já cadastrado")
      );

      expect(repo.create).not.toHaveBeenCalled();
    });

    it("should throw BAD_REQUEST if password is missing", async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.findByUserName.mockResolvedValue(null);

      const invalidInput = { ...mockUserInput, password: "" };

      await expect(userService.createUser(invalidInput)).rejects.toMatchObject({
        statusCode: httpStatus.BAD_REQUEST,
        message: "Senha é obrigatória e deve ser uma string",
      });

      expect(repo.create).not.toHaveBeenCalled();
    });

    it("should throw BAD_REQUEST if password is not a string", async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.findByUserName.mockResolvedValue(null);

      const invalidInput = { ...mockUserInput, password: 123456 };

      await expect(userService.createUser(invalidInput as any)).rejects.toMatchObject({
        statusCode: httpStatus.BAD_REQUEST,
        message: "Senha é obrigatória e deve ser uma string",
      });

      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe("getUserById", () => {
    it("should return a user by id", async () => {
      const mockUser = { id: "u_1", passwordHash: "hash" } as any;
      repo.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById("u_1");

      expect(repo.findById).toHaveBeenCalledWith("u_1");
      expect(result).toEqual({ id: "u_1" });
      expect((result as any).passwordHash).toBeUndefined();
    });

    it("should throw NOT_FOUND if user does not exist", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(userService.getUserById("u_1")).rejects.toThrow(
        new ApiError(httpStatus.NOT_FOUND, "Usuário não encontrado")
      );
    });
  });

  describe("getUserByUserName", () => {
    it("should return a user by username", async () => {
      const mockUser = { id: "u_1", userName: "test", passwordHash: "hash" } as any;
      repo.findByUserName.mockResolvedValue(mockUser);

      const result = await userService.getUserByUserName("test");

      expect(repo.findByUserName).toHaveBeenCalledWith("test");
      expect(result).toEqual({ id: "u_1", userName: "test" });
    });

    it("should throw NOT_FOUND if user does not exist", async () => {
      repo.findByUserName.mockResolvedValue(null);

      await expect(userService.getUserByUserName("test")).rejects.toThrow(
        new ApiError(httpStatus.NOT_FOUND, "Usuário não encontrado")
      );
    });
  });

  describe("getAllUsers", () => {
    it("should return all users without passwords", async () => {
      const mockUsers = [
        { id: "u_1", passwordHash: "hash1" },
        { id: "u_2", passwordHash: "hash2" },
      ] as any;
      
      repo.findAll.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(repo.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect((result[0] as any).passwordHash).toBeUndefined();
    });
  });

  describe("updateUser", () => {
    const userId = "u_1";
    const userName = "testuser";
    const authUserId = "u_1";

    it("should update user successfully", async () => {
      const mockUser = { id: userId, userName, passwordHash: "hash" } as any;
      const updateData = { name: "New Name" };
      const updatedUser = { ...mockUser, ...updateData };

      repo.findByUserName.mockResolvedValue(mockUser);
      repo.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(userName, authUserId, updateData);

      expect(repo.findByUserName).toHaveBeenCalledWith(userName);
      expect(repo.update).toHaveBeenCalledWith(userId, updateData);
      expect(result.name).toBe("New Name");
    });

    it("should hash password if provided in update", async () => {
      const mockUser = { id: userId, userName, passwordHash: "oldhash" } as any;
      const updateData = { passwordHash: "newpassword" };
      
      repo.findByUserName.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedNewPassword" as any);
      repo.update.mockResolvedValue({ ...mockUser, passwordHash: "hashedNewPassword" });

      await userService.updateUser(userName, authUserId, updateData);

      expect(bcrypt.hash).toHaveBeenCalledWith("newpassword", 10);
      expect(repo.update).toHaveBeenCalledWith(userId, { passwordHash: "hashedNewPassword" });
    });

    it("should throw NOT_FOUND if user to update does not exist", async () => {
      repo.findByUserName.mockResolvedValue(null);

      await expect(userService.updateUser("unknown", authUserId, {})).rejects.toThrow(
        new ApiError(httpStatus.NOT_FOUND, "Usuário não encontrado")
      );
    });

    it("should throw FORBIDDEN if user tries to update another user", async () => {
      const otherUser = { id: "u_2", userName: "other" } as any;
      repo.findByUserName.mockResolvedValue(otherUser);

      await expect(userService.updateUser("other", authUserId, {})).rejects.toThrow(
        new ApiError(httpStatus.FORBIDDEN, "Você não tem permissão para atualizar este usuário")
      );
    });
  });

  describe("deleteUser", () => {
    const userName = "testuser";
    const userId = "u_1";
    const authUserId = "u_1";

    it("should delete user successfully", async () => {
      const mockUser = { id: userId, userName } as any;
      repo.findByUserName.mockResolvedValue(mockUser);
      repo.delete.mockResolvedValue(undefined as any);

      await userService.deleteUser(userName, authUserId);

      expect(repo.delete).toHaveBeenCalledWith(userId);
    });

    it("should throw NOT_FOUND if user does not exist", async () => {
      repo.findByUserName.mockResolvedValue(null);

      await expect(userService.deleteUser("unknown", authUserId)).rejects.toThrow(
        new ApiError(httpStatus.NOT_FOUND, "Usuário não encontrado")
      );
    });

    it("should throw FORBIDDEN if user tries to delete another user", async () => {
      const otherUser = { id: "u_2", userName: "other" } as any;
      repo.findByUserName.mockResolvedValue(otherUser);

      await expect(userService.deleteUser("other", authUserId)).rejects.toThrow(
        new ApiError(httpStatus.FORBIDDEN, "Você não tem permissão para deletar este usuário")
      );
    });
  });

  describe("updateProfileImage", () => {
    const userId = "u_1";
    const fileBuffer = Buffer.from("image");

    it("should update profile image successfully", async () => {
      const mockUser = { id: userId, profileImageId: "old_pid" } as any;
      const uploadResult = { url: "new_url", publicId: "new_pid" };
      const updatedUser = { ...mockUser, profileImageUrl: uploadResult.url, profileImageId: uploadResult.publicId };

      repo.findById.mockResolvedValue(mockUser);
      uploadMock.uploadProfileImage.mockResolvedValue(uploadResult as any);
      repo.update.mockResolvedValue(updatedUser);

      const result = await userService.updateProfileImage(userId, fileBuffer);

      expect(repo.findById).toHaveBeenCalledWith(userId);
      expect(uploadMock.uploadProfileImage).toHaveBeenCalledWith(fileBuffer, userId, "old_pid");
      expect(repo.update).toHaveBeenCalledWith(userId, {
        profileImageUrl: "new_url",
        profileImageId: "new_pid"
      });
      expect(result.profileImageId).toBe("new_pid");
    });

    it("should throw NOT_FOUND if user does not exist", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(userService.updateProfileImage(userId, fileBuffer)).rejects.toThrow(
        new ApiError(httpStatus.NOT_FOUND, "Usuário não encontrado")
      );
      expect(uploadMock.uploadProfileImage).not.toHaveBeenCalled();
    });
  });

  describe("updateBannerImage", () => {
    const userId = "u_1";
    const fileBuffer = Buffer.from("banner");

    it("should update banner image successfully", async () => {
      const mockUser = { id: userId, bannerImageId: "old_bid" } as any;
      const uploadResult = { url: "new_banner_url", publicId: "new_bid" };
      const updatedUser = { ...mockUser, bannerImageUrl: uploadResult.url, bannerImageId: uploadResult.publicId };

      repo.findById.mockResolvedValue(mockUser);
      uploadMock.uploadBannerImage.mockResolvedValue(uploadResult as any);
      repo.update.mockResolvedValue(updatedUser);

      const result = await userService.updateBannerImage(userId, fileBuffer);

      expect(repo.findById).toHaveBeenCalledWith(userId);
      expect(uploadMock.uploadBannerImage).toHaveBeenCalledWith(fileBuffer, userId, "old_bid");
      expect(repo.update).toHaveBeenCalledWith(userId, {
        bannerImageUrl: "new_banner_url",
        bannerImageId: "new_bid"
      });
      expect(result.bannerImageId).toBe("new_bid");
    });

    it("should throw NOT_FOUND if user does not exist", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(userService.updateBannerImage(userId, fileBuffer)).rejects.toThrow(
        new ApiError(httpStatus.NOT_FOUND, "Usuário não encontrado")
      );
      expect(uploadMock.uploadBannerImage).not.toHaveBeenCalled();
    });
  });

  describe("deleteProfileImage", () => {
    const userId = "u_1";

    it("should delete profile image if user has one", async () => {
      const mockUser = { id: userId, profileImageId: "pid_123" } as any;
      const updatedUser = { ...mockUser, profileImageUrl: null, profileImageId: null };

      repo.findById.mockResolvedValue(mockUser);
      uploadMock.deleteImage.mockResolvedValue(undefined as any);
      repo.update.mockResolvedValue(updatedUser);

      await userService.deleteProfileImage(userId);

      expect(repo.findById).toHaveBeenCalledWith(userId);
      expect(uploadMock.deleteImage).toHaveBeenCalledWith("pid_123");
      expect(repo.update).toHaveBeenCalledWith(userId, {
        profileImageUrl: null,
        profileImageId: null
      });
    });

    it("should not call deleteImage if user does not have profile image", async () => {
      const mockUser = { id: userId, profileImageId: null } as any;
      const updatedUser = { ...mockUser };

      repo.findById.mockResolvedValue(mockUser);
      repo.update.mockResolvedValue(updatedUser);

      await userService.deleteProfileImage(userId);

      expect(uploadMock.deleteImage).not.toHaveBeenCalled();
      expect(repo.update).toHaveBeenCalledWith(userId, {
        profileImageUrl: null,
        profileImageId: null
      });
    });

    it("should throw NOT_FOUND if user does not exist", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(userService.deleteProfileImage(userId)).rejects.toThrow(
        new ApiError(httpStatus.NOT_FOUND, "Usuário não encontrado")
      );
    });
  });

  describe("deleteBannerImage", () => {
    const userId = "u_1";

    it("should delete banner image if user has one", async () => {
      const mockUser = { id: userId, bannerImageId: "bid_123" } as any;
      const updatedUser = { ...mockUser, bannerImageUrl: null, bannerImageId: null };

      repo.findById.mockResolvedValue(mockUser);
      uploadMock.deleteImage.mockResolvedValue(undefined as any);
      repo.update.mockResolvedValue(updatedUser);

      await userService.deleteBannerImage(userId);

      expect(repo.findById).toHaveBeenCalledWith(userId);
      expect(uploadMock.deleteImage).toHaveBeenCalledWith("bid_123");
      expect(repo.update).toHaveBeenCalledWith(userId, {
        bannerImageUrl: null,
        bannerImageId: null
      });
    });

    it("should not call deleteImage if user does not have banner image", async () => {
      const mockUser = { id: userId, bannerImageId: null } as any;
      const updatedUser = { ...mockUser };

      repo.findById.mockResolvedValue(mockUser);
      repo.update.mockResolvedValue(updatedUser);

      await userService.deleteBannerImage(userId);

      expect(uploadMock.deleteImage).not.toHaveBeenCalled();
      expect(repo.update).toHaveBeenCalledWith(userId, {
        bannerImageUrl: null,
        bannerImageId: null
      });
    });

    it("should throw NOT_FOUND if user does not exist", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(userService.deleteBannerImage(userId)).rejects.toThrow(
        new ApiError(httpStatus.NOT_FOUND, "Usuário não encontrado")
      );
    });
  });
});