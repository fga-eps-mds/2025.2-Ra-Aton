import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import { authService } from "../../modules/auth/auth.service";
import userRepository from "../../modules/user/user.repository";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import { User, ProfileType } from "@prisma/client";
import { config } from "../../config/env";

// Mock dos módulos
jest.mock("../../modules/user/user.repository");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../config/env", () => ({
  config: {
    JWT_SECRET: "test-secret",
    JWT_EXPIRES_IN: "1h",
  },
}));

describe("AuthService", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const createMockUser = (overrides?: Partial<User>): User => {
    return {
      id: "user-123",
      name: "Test User",
      email: "test@example.com",
      userName: "testuser",
      passwordHash: "$2a$10$hashedPassword",
      profileType: ProfileType.JOGADOR,
      createdAt: new Date(),
      updatedAt: new Date(),
      notificationsAllowed: true,
      bio: null,
      profileImageUrl: null,
      bannerImageUrl: null,
      profileImageId: null,
      bannerImageId: null,
      ...overrides,
    };
  };

  describe("login", () => {
    it("should successfully login a user with valid credentials", async () => {
      const mockUser = createMockUser();
      const email = "test@example.com";
      const password = "correctPassword";
      const mockToken = "mock-jwt-token";

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (sign as jest.Mock).mockReturnValue(mockToken);

      const result = await authService.login(email, password);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.passwordHash);
      expect(sign).toHaveBeenCalledWith(
        { id: mockUser.id },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
      );
      expect(result).toEqual({
        token: mockToken,
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          userName: mockUser.userName,
          profileType: mockUser.profileType,
          bannerImage: null,
          profilePicture: null,
        },
        warns: [],
      });
    });

    it("should throw UNAUTHORIZED error when user is not found", async () => {
      const email = "nonexistent@example.com";
      const password = "anyPassword";

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(email, password)).rejects.toThrow(ApiError);
      await expect(authService.login(email, password)).rejects.toMatchObject({
        statusCode: httpStatus.UNAUTHORIZED,
        message: "E-mail não encontrado.",
      });

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("should throw INTERNAL_SERVER_ERROR when user has no password hash", async () => {
      const mockUser = createMockUser({ passwordHash: "" });
      const email = "test@example.com";
      const password = "anyPassword";

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.login(email, password)).rejects.toThrow(ApiError);
      await expect(authService.login(email, password)).rejects.toMatchObject({
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Conta de usuário inválida.",
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Usuário ${mockUser.id} não possui hash de senha no banco.`
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("should throw INTERNAL_SERVER_ERROR when passwordHash is null", async () => {
      const mockUser = createMockUser({ passwordHash: null as any });
      const email = "test@example.com";
      const password = "anyPassword";

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.login(email, password)).rejects.toThrow(ApiError);
      await expect(authService.login(email, password)).rejects.toMatchObject({
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Conta de usuário inválida.",
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Usuário ${mockUser.id} não possui hash de senha no banco.`
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("should throw INTERNAL_SERVER_ERROR when passwordHash is undefined", async () => {
      const mockUser = createMockUser({ passwordHash: undefined as any });
      const email = "test@example.com";
      const password = "anyPassword";

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.login(email, password)).rejects.toThrow(ApiError);
      await expect(authService.login(email, password)).rejects.toMatchObject({
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Conta de usuário inválida.",
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Usuário ${mockUser.id} não possui hash de senha no banco.`
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("should throw UNAUTHORIZED error when password is incorrect", async () => {
      const mockUser = createMockUser();
      const email = "test@example.com";
      const password = "wrongPassword";

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(email, password)).rejects.toThrow(ApiError);
      await expect(authService.login(email, password)).rejects.toMatchObject({
        statusCode: httpStatus.UNAUTHORIZED,
        message: "E-mail ou senha incorretos.",
      });

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.passwordHash);
      expect(sign).not.toHaveBeenCalled();
    });

    it("should include warning when profileType is null", async () => {
      const mockUser = createMockUser({ profileType: null });
      const email = "test@example.com";
      const password = "correctPassword";
      const mockToken = "mock-jwt-token";

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (sign as jest.Mock).mockReturnValue(mockToken);

      const result = await authService.login(email, password);

      expect(result).toEqual({
        token: mockToken,
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          userName: mockUser.userName,
          profileType: null,
          bannerImage: null,
          profilePicture: null,
        },
        warns: ["Configuração de perfil pendente."],
      });
    });

    it("should not include warning when profileType is set", async () => {
      const mockUser = createMockUser({ profileType: ProfileType.JOGADOR });
      const email = "test@example.com";
      const password = "correctPassword";
      const mockToken = "mock-jwt-token";

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (sign as jest.Mock).mockReturnValue(mockToken);

      const result = await authService.login(email, password);

      expect(result.warns).toEqual([]);
    });

    it("should use default JWT_EXPIRES_IN when config value is null", async () => {
      const mockUser = createMockUser();
      const email = "test@example.com";
      const password = "correctPassword";
      const mockToken = "mock-jwt-token";

      // Temporarily modify config
      const originalExpiresIn = config.JWT_EXPIRES_IN;
      (config as any).JWT_EXPIRES_IN = null;

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (sign as jest.Mock).mockReturnValue(mockToken);

      await authService.login(email, password);

      expect(sign).toHaveBeenCalledWith(
        { id: mockUser.id },
        config.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Restore config
      (config as any).JWT_EXPIRES_IN = originalExpiresIn;
    });

    it("should use default JWT_EXPIRES_IN when config value is undefined", async () => {
      const mockUser = createMockUser();
      const email = "test@example.com";
      const password = "correctPassword";
      const mockToken = "mock-jwt-token";

      // Temporarily modify config
      const originalExpiresIn = config.JWT_EXPIRES_IN;
      (config as any).JWT_EXPIRES_IN = undefined;

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (sign as jest.Mock).mockReturnValue(mockToken);

      await authService.login(email, password);

      expect(sign).toHaveBeenCalledWith(
        { id: mockUser.id },
        config.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Restore config
      (config as any).JWT_EXPIRES_IN = originalExpiresIn;
    });

    it("should handle different ProfileType values", async () => {
      const profileTypes = [
        ProfileType.JOGADOR,
        ProfileType.TORCEDOR,
        ProfileType.ATLETICA,
      ];

      for (const profileType of profileTypes) {
        const mockUser = createMockUser({ profileType });
        const email = "test@example.com";
        const password = "correctPassword";
        const mockToken = "mock-jwt-token";

        (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (sign as jest.Mock).mockReturnValue(mockToken);

        const result = await authService.login(email, password);

        expect(result.user.profileType).toBe(profileType);
        expect(result.warns).toEqual([]);
      }
    });

    // it("should format user response correctly without sensitive data", async () => {
    //   const mockUser = createMockUser({
    //     bio: "Some bio",
    //     profileImageUrl: null,
    //     bannerImageUrl: null,
    //   });
    //   const email = "test@example.com";
    //   const password = "correctPassword";
    //   const mockToken = "mock-jwt-token";

    //   (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
    //   (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    //   (sign as jest.Mock).mockReturnValue(mockToken);

    //   const result = await authService.login(email, password);

    //   // Verifica que apenas os campos específicos estão no response
    //   expect(result.user).toEqual({
    //     id: mockUser.id,
    //     name: mockUser.name,
    //     email: mockUser.email,
    //     userName: mockUser.userName,
    //     profileType: mockUser.profileType,
    //     bannerImage: mockUser.bannerImageId,
    //     profilePicture: mockUser.profileImageUrl,
    //   });

    //   // Verifica que dados sensíveis não estão no response
    //   expect(result.user).not.toHaveProperty("passwordHash");
    //   expect(result.user).not.toHaveProperty("bio");
    //   expect(result.user).not.toHaveProperty("profileImageUrl");
    //   expect(result.user).not.toHaveProperty("createdAt");
    // });
  });
});
