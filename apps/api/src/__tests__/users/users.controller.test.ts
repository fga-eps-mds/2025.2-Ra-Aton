import userController from "../../modules/user/user.controller";
import { userService } from "../../modules/user/user.service";
import { Request, Response } from "express";
import HttpStatus from "http-status";

// TODO: adicionar caminhos tristes para os testes

// Mock do módulo userService
jest.mock("../../modules/user/user.service");

describe("UserController", () => {
  // Limpar mocks entre testes
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create a user and return 201", async () => {
      // Arrange: preparar dados de entrada e saída esperada
      const mockUserInput = {
        userName: "testuser",
        email: "test@example.com",
        name: "Test User",
        profileType: "ATLETICA",
        password: "testpassword",
      };

      const mockUserResponse = {
        id: "123",
        userName: "testuser",
        email: "test@example.com",
        name: "Test User",
        profileType: "ATLETICA",
        createdAt: new Date(),
        updatedAt: new Date(),
        // Note: passwordHash não é retornado pelo service (Omit<User, "passwordHash">)
      };

      // Mock da requisição
      const req = {
        body: mockUserInput,
      } as Request;

      // Mock da resposta
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        locals: {
          newUserId: undefined,
          newUserName: undefined,
        },
      } as unknown as Response;

      // Mock do método createUser do userService
      (userService.createUser as jest.Mock).mockResolvedValue(mockUserResponse);

      // Act: executar o método do controller
      await userController.createUser(req, res);

      // Assert: verificar se o service foi chamado corretamente
      expect(userService.createUser).toHaveBeenCalledWith(mockUserInput);
      expect(userService.createUser).toHaveBeenCalledTimes(1);

      // Verificar se a resposta foi enviada corretamente
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(mockUserResponse);
    });

    it("should handle errors when creating a user", async () => {
      // Arrange: preparar cenário de erro
      const mockUserInput = {
        userName: "testuser",
        email: "test@example.com",
        name: "Test User",
        profileType: "ATLETICA",
        password: "testpassword",
      };

      const req = {
        body: mockUserInput,
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      // Mock do service para lançar erro
      const mockError = new Error("Database error");
      (userService.createUser as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert: verificar que o erro é propagado
      await expect(userController.createUser(req, res)).rejects.toThrow(
        "Database error",
      );

      expect(userService.createUser).toHaveBeenCalledWith(mockUserInput);
    });
  });

  describe("listUsers", () => {
    it("should return all users with status 200", async () => {
      // Arrange
      const mockUsers = [
        {
          id: "1",
          userName: "user1",
          email: "user1@example.com",
          name: "User One",
          profileType: "ATLETICA",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          userName: "user2",
          email: "user2@example.com",
          name: "User Two",
          profileType: "JOGADOR",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const req = {} as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      (userService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

      // Act
      await userController.listUsers(req, res);

      // Assert
      expect(userService.getAllUsers).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });
  });

  describe("getUser", () => {
    it("should return a user by userName with status 200", async () => {
      // Arrange
      const mockUser = {
        id: "1",
        userName: "testuser",
        email: "test@example.com",
        name: "Test User",
        profileType: "ATLETICA",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const req = {
        params: { userName: "testuser" },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      (userService.getUserByUserName as jest.Mock).mockResolvedValue(mockUser);

      // Act
      await userController.getUser(req, res);

      // Assert
      expect(userService.getUserByUserName).toHaveBeenCalledWith("testuser");
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it("should return 400 when userName is not provided", async () => {
      // Arrange
      const req = {
        params: {},
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      // Act
      await userController.getUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "O nome de usuário é obrigatório.",
      });
      expect(userService.getUserByUserName).not.toHaveBeenCalled();
    });
  });

  describe("updateUser", () => {
    it("should update a user with status 200", async () => {
      // Arrange
      const mockUser = {
        id: "1",
        userName: "testuser",
        email: "test@example.com",
        name: "Test User",
        profileType: "ATLETICA",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const req = {
        user: { id: "1" },
        params: { userName: "testuser" },
        body: {
          name: "Updated User Name",
          email: "updated@example",
        },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      (userService.updateUser as jest.Mock).mockResolvedValue(mockUser);

      // Act
      await userController.updateUser(req, res);

      // Assert
      expect(userService.updateUser).toHaveBeenCalledWith(
        "testuser",
        "1",
        req.body,
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });
  });

  describe("deleteUser", () => {
    it("should delete a user with status 204", async () => {
      // Arrange
      const req = {
        user: { id: "1" },
        params: { userName: "testuser" },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      } as unknown as Response;

      (userService.deleteUser as jest.Mock).mockResolvedValue(undefined);

      // Act
      await userController.deleteUser(req, res);

      // Assert
      expect(userService.deleteUser).toHaveBeenCalledWith("testuser", "1");
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalledWith();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
