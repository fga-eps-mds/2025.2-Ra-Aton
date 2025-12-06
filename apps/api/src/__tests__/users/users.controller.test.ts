import userController from "../../modules/user/user.controller";
import { userService } from "../../modules/user/user.service";
import { Request, Response } from "express";
import HttpStatus from "http-status";
// Importe a classe ApiError para poder usá-la nos testes
import { ApiError } from "../../utils/ApiError"; 

// Mock do módulo userService
jest.mock("../../modules/user/user.service");

describe("UserController", () => {
  // Limpar mocks entre testes
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ... (Testes de createUser, listUsers e getUser mantidos iguais) ...
  describe("createUser", () => {
    it("should create a user and return 201", async () => {
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
      };

      const req = {
        body: mockUserInput,
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        locals: {
          newUserId: undefined,
          newUserName: undefined,
        },
      } as unknown as Response;

      (userService.createUser as jest.Mock).mockResolvedValue(mockUserResponse);

      await userController.createUser(req, res);

      expect(userService.createUser).toHaveBeenCalledWith(mockUserInput);
      expect(userService.createUser).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(mockUserResponse);
    });

    it("should handle errors when creating a user", async () => {
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

      const mockError = new Error("Database error");
      (userService.createUser as jest.Mock).mockRejectedValue(mockError);

      await expect(userController.createUser(req, res)).rejects.toThrow(
        "Database error",
      );

      expect(userService.createUser).toHaveBeenCalledWith(mockUserInput);
    });
  });

  describe("listUsers", () => {
    it("should return all users with status 200", async () => {
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
      ];

      const req = {} as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      (userService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

      await userController.listUsers(req, res);

      expect(userService.getAllUsers).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });
  });

  describe("getUser", () => {
    it("should return a user by userName with status 200", async () => {
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

      await userController.getUser(req, res);

      expect(userService.getUserByUserName).toHaveBeenCalledWith("testuser");
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it("should return 400 when userName is not provided", async () => {
      const req = {
        params: {},
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await userController.getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "O nome de usuário é obrigatório.",
      });
      expect(userService.getUserByUserName).not.toHaveBeenCalled();
    });
  });

  describe("updateUser", () => {
    it("should update a user with status 200", async () => {
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

      await userController.updateUser(req, res);

      expect(userService.updateUser).toHaveBeenCalledWith(
        "testuser",
        "1",
        req.body,
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    // Novo teste: userName não fornecido
    it("should return 400 when userName is not provided for update", async () => {
      const req = {
        params: {},
        body: { name: "New Name" },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "O nome de usuário é obrigatório para atualização.",
      });
      expect(userService.updateUser).not.toHaveBeenCalled();
    });

    // Novo teste: ApiError
    it("should return specific status code when ApiError occurs", async () => {
      const req = {
        user: { id: "1" },
        params: { userName: "testuser" },
        body: { name: "New Name" },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const apiError = new ApiError(HttpStatus.NOT_FOUND, "User not found");
      (userService.updateUser as jest.Mock).mockRejectedValue(apiError);

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    // Novo teste: Erro Genérico
    it("should return 500 when a generic error occurs", async () => {
      const req = {
        user: { id: "1" },
        params: { userName: "testuser" },
        body: { name: "New Name" },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const genericError = new Error("Unexpected error");
      (userService.updateUser as jest.Mock).mockRejectedValue(genericError);

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erro ao atualizar usuário",
      });
    });
  });

  describe("deleteUser", () => {
    it("should delete a user with status 204", async () => {
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

      await userController.deleteUser(req, res);

      expect(userService.deleteUser).toHaveBeenCalledWith("testuser", "1");
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalledWith();
      expect(res.json).not.toHaveBeenCalled();
    });

    // Novo teste: userName não fornecido
    it("should return 400 when userName is not provided for deletion", async () => {
      const req = {
        params: {},
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "O nome de usuário é obrigatório para exclusão.",
      });
      expect(userService.deleteUser).not.toHaveBeenCalled();
    });

    // Novo teste: ApiError
    it("should return specific status code when ApiError occurs during deletion", async () => {
      const req = {
        user: { id: "1" },
        params: { userName: "testuser" },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const apiError = new ApiError(HttpStatus.FORBIDDEN, "Not allowed");
      (userService.deleteUser as jest.Mock).mockRejectedValue(apiError);

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({ message: "Not allowed" });
    });

    // Novo teste: Erro Genérico
    it("should return 500 when a generic error occurs during deletion", async () => {
      const req = {
        user: { id: "1" },
        params: { userName: "testuser" },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const genericError = new Error("Unexpected error");
      (userService.deleteUser as jest.Mock).mockRejectedValue(genericError);

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erro ao deletar usuário",
      });
    });
  });
});