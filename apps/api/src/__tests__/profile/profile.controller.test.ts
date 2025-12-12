// MOCK DO AMBIENTE
jest.mock("../../config/env", () => ({
  env: {
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    NODE_ENV: "test",
    JWT_SECRET: "test-secret",
    JWT_EXPIRES_IN: "1h",
    EXPO_ACCESS_TOKEN: "test-token",
  },
}));

// MOCK DO CLOUDINARY
jest.mock("../../config/cloudinary", () => ({
  uploader: {
    upload_stream: jest.fn(),
    destroy: jest.fn(),
  },
  config: jest.fn(),
}));

import type { Request, Response } from "express";
import httpStatus from "http-status";
import profileController from "../../modules/profile/profile.controller";
import profileService from "../../modules/profile/profile.service";     
import { ApiError } from "../../utils/ApiError";

// MOCK DO SERVICE
jest.mock("../../modules/profile/profile.service");

describe("ProfileController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();

    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe("getUserProfile", () => {
    it("Deve retornar o perfil de usuário", async () => {
      const mockData = { profile: { id: "user-id" }, tabs: {} };
      const authUser = { id: "auth-id" };

      req = {
        params: { userName: "testuser" },
        user: authUser,
      } as any;

      (profileService.fetchUserProfile as jest.Mock).mockResolvedValue(mockData);

      await profileController.getUserProfile(req as Request, res as Response);

      expect(profileService.fetchUserProfile).toHaveBeenCalledWith("testuser", "auth-id");
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it("Deve retornar 400 caso o userName não esteja presente", async () => {
      req = {
        params: {},
        user: { id: "auth-id" },
      } as any;

      await profileController.getUserProfile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: "userName é obrigatório" });
      expect(profileService.fetchUserProfile).not.toHaveBeenCalled();
    });

    it("Deve lidar com os erros corretamente", async () => {
      req = {
        params: { userName: "unknown" },
      } as any;

      const error = new ApiError(httpStatus.NOT_FOUND, "Perfil de usuário não encontrado");
      (profileService.fetchUserProfile as jest.Mock).mockRejectedValue(error);

      await profileController.getUserProfile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR); // trocar por NOT_FOUND
      expect(res.json).toHaveBeenCalledWith({ message: "Perfil de usuário não encontrado" });
    });

    it("Deve lidar com erros genericos com status 500", async () => {
      req = { params: { userName: "user" } } as any;

      (profileService.fetchUserProfile as jest.Mock).mockRejectedValue(new Error("Database error"));

      await profileController.getUserProfile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    });
  });

  describe("getGroupProfile", () => {
    it("Deve retornar o perfil do grupo", async () => {
      const mockData = { profile: { id: "group-id" }, tabs: {} };

      req = {
        params: { groupName: "testgroup" },
        user: { id: "auth-id" },
      } as any;

      (profileService.fetchGroupProfile as jest.Mock).mockResolvedValue(mockData);

      await profileController.getGroupProfile(req as Request, res as Response);

      expect(profileService.fetchGroupProfile).toHaveBeenCalledWith("testgroup", "auth-id");
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it("Deve retornar 400 caso o grouopName não esteja presente", async () => {
      req = { params: {} } as any;

      await profileController.getGroupProfile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: "groupName é obrigatório" });
    });

    it("Deve lidar com os error corretamente", async () => {
      req = { params: { groupName: "group" } } as any;

      const error = new ApiError(httpStatus.NOT_FOUND, "Grupo não encontrado");
      (profileService.fetchGroupProfile as jest.Mock).mockRejectedValue(error);

      await profileController.getGroupProfile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR); // trocar por NOT_FOUND
      expect(res.json).toHaveBeenCalledWith({ message: "Grupo não encontrado" });
    });
  });

  describe("updateGroupImages", () => {
    it("Deve atualizar as imagens corretamente", async () => {
      const authUser = { id: "user-id" };
      const groupId = "group-id";

      const mockFiles = {
        logoImage: [{ originalname: "logo.png" }],
        bannerImage: [{ originalname: "banner.png" }]
      };

      req = {
        params: { groupId },
        user: authUser,
        files: mockFiles,
        body: { bio: "Nova descrição" }
      } as any;

      const mockResult = { message: "Imagens atualizadas com sucesso", group: {} };
      (profileService.updateGroupImages as jest.Mock).mockResolvedValue(mockResult);

      await profileController.updateGroupImages(req as Request, res as Response);

      expect(profileService.updateGroupImages).toHaveBeenCalledWith(
        groupId,
        authUser.id,
        mockFiles.logoImage[0],
        mockFiles.bannerImage[0],
        "Nova descrição"
      );
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("Deve retornar 400 se o id do grupo não estiver presente", async () => {
      req = {
        params: {},
        user: { id: "user-id" }
      } as any;

      await profileController.updateGroupImages(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: "groupId é obrigatório" });
    });

    it("Deve retornar 401 caso o usuário não tenha permissão", async () => {
      req = {
        params: { groupId: "group-id" },
        user: undefined // Simula usuário não logado
      } as any;

      await profileController.updateGroupImages(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith({ message: "Usuário não autenticado" });
    });

    it("Deve lidar com alterações parciais", async () => {
      const authUser = { id: "user-id" };

      req = {
        params: { groupId: "group-id" },
        user: authUser,
        files: {
          logoImage: [{ originalname: "logo.png" }]
        },
        body: {}
      } as any;

      (profileService.updateGroupImages as jest.Mock).mockResolvedValue({});

      await profileController.updateGroupImages(req as Request, res as Response);

      expect(profileService.updateGroupImages).toHaveBeenCalledWith(
        "group-id",
        "user-id",
        expect.anything(),
        undefined,
        undefined 
      );
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    });

    it("Deve lidar com os erros corretamente", async () => {
      req = {
        params: { groupId: "group-id" },
        user: { id: "user-id" },
        files: {},
        body: {}
      } as any;

      const error = new ApiError(httpStatus.FORBIDDEN, "Sem permissão");
      (profileService.updateGroupImages as jest.Mock).mockRejectedValue(error);

      await profileController.updateGroupImages(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: "Sem permissão" });
    });
  });
});