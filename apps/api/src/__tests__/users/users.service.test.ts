import { userService } from "../../modules/user/user.service";
import userRepository from "../../modules/user/user.repository";
import bcrypt from "bcryptjs";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

// Mock do repositório de usuários
jest.mock("../../modules/user/user.repository");

// Helper para ter tipagem correta nos mocks
const repo = jest.mocked(userRepository);

describe("UserService", () => {
  // Limpar mocks entre testes para evitar interferência
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ======================================================
  // CREATE USER
  // ======================================================
  describe("createUser", () => {
    const mockUserInput = {
      name: "Test User",
      userName: "testuser",
      email: "test@example.com",
      password: "testpassword",
    };

    it("should create a user successfully", async () => {
      // Arrange
      jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedPassword" as any);
      repo.findByEmail.mockResolvedValue(null);
      repo.findByUserName.mockResolvedValue(null);

      const now = new Date();
      repo.create.mockResolvedValue({
        id: "u_1",
        ...mockUserInput,
        profileType: null,
        passwordHash: "hashedPassword", // O repositório retorna com hash
        createdAt: now,
        updatedAt: now,
      });

      // Act
      const result = await userService.createUser(mockUserInput);

      // Assert
      expect(repo.findByEmail).toHaveBeenCalledWith(mockUserInput.email);
      expect(repo.findByUserName).toHaveBeenCalledWith(mockUserInput.userName);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockUserInput.password, 10);
      expect(repo.create).toHaveBeenCalledTimes(1);
      
      // Verifica se a senha foi removida do retorno
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

    // --- TESTES PARA COBERTURA DO IF DE SENHA ---
    it("should throw BAD_REQUEST if password is missing", async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.findByUserName.mockResolvedValue(null);

      const invalidInput = { ...mockUserInput, password: "" }; // Senha vazia

      await expect(userService.createUser(invalidInput)).rejects.toMatchObject({
        statusCode: httpStatus.BAD_REQUEST,
        message: "Senha é obrigatória e deve ser uma string",
      });

      expect(repo.create).not.toHaveBeenCalled();
    });

    it("should throw BAD_REQUEST if password is not a string", async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.findByUserName.mockResolvedValue(null);

      const invalidInput = { ...mockUserInput, password: 123456 }; // Tipo errado

      await expect(userService.createUser(invalidInput as any)).rejects.toMatchObject({
        statusCode: httpStatus.BAD_REQUEST,
        message: "Senha é obrigatória e deve ser uma string",
      });

      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  // ======================================================
  // GET USER BY ID
  // ======================================================
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

  // ======================================================
  // GET USER BY USERNAME
  // ======================================================
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

  // ======================================================
  // GET ALL USERS
  // ======================================================
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

  // ======================================================
  // UPDATE USER
  // ======================================================
  describe("updateUser", () => {
    const userId = "u_1";
    const userName = "testuser";
    const authUserId = "u_1"; // Mesmo usuário (autorizado)

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
      const updateData = { passwordHash: "newpassword" }; // A tipagem no service espera passwordHash
      
      repo.findByUserName.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedNewPassword" as any);
      repo.update.mockResolvedValue({ ...mockUser, passwordHash: "hashedNewPassword" });

      await userService.updateUser(userName, authUserId, updateData);

      expect(bcrypt.hash).toHaveBeenCalledWith("newpassword", 10);
      // Verifica se o update foi chamado com a senha hasheada
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

  // ======================================================
  // DELETE USER
  // ======================================================
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
});