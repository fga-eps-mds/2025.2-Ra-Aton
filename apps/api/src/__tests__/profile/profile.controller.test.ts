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

    it("Deve lidar com erros com status específico", async () => {
      req = {
        params: { userName: "unknown" },
        user: { id: "auth-id" }
      } as any;

      const error = { status: httpStatus.NOT_FOUND, message: "Perfil de usuário não encontrado" };
      (profileService.fetchUserProfile as jest.Mock).mockRejectedValue(error);

      await profileController.getUserProfile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: "Perfil de usuário não encontrado" });
    });

    it("Deve lidar com erros sem status (default 500)", async () => {
      req = { 
        params: { userName: "user" },
        user: { id: "auth-id" }
      } as any;

      (profileService.fetchUserProfile as jest.Mock).mockRejectedValue(new Error("Database error"));

      await profileController.getUserProfile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    });

    it("Deve lidar com erros sem mensagem (default message)", async () => {
      req = { 
        params: { userName: "user" },
        user: { id: "auth-id" }
      } as any;

      (profileService.fetchUserProfile as jest.Mock).mockRejectedValue({});

      await profileController.getUserProfile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: "Erro ao obter perfil do usuário" });
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
      req = { 
        params: { groupName: "group" },
        user: { id: "auth-id" }
      } as any;

      const error = { status: httpStatus.NOT_FOUND, message: "Grupo não encontrado" };
      (profileService.fetchGroupProfile as jest.Mock).mockRejectedValue(error);

      await profileController.getGroupProfile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: "Grupo não encontrado" });
    });

    it("Deve lidar com erros sem status (default 500)", async () => {
      req = { 
        params: { groupName: "group" },
        user: { id: "auth-id" }
      } as any;

      (profileService.fetchGroupProfile as jest.Mock).mockRejectedValue(new Error("Database error"));

      await profileController.getGroupProfile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    });

    it("Deve lidar com erros sem mensagem (default message)", async () => {
      req = { 
        params: { groupName: "group" },
        user: { id: "auth-id" }
      } as any;

      (profileService.fetchGroupProfile as jest.Mock).mockRejectedValue({});

      await profileController.getGroupProfile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: "Erro ao obter perfil do grupo" });
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

      const error = { status: httpStatus.FORBIDDEN, message: "Sem permissão" };
      (profileService.updateGroupImages as jest.Mock).mockRejectedValue(error);

      await profileController.updateGroupImages(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({ message: "Sem permissão" });
    });

    it("Deve lidar com erros sem status (default 500)", async () => {
      req = {
        params: { groupId: "group-id" },
        user: { id: "user-id" },
        files: {},
        body: {}
      } as any;

      (profileService.updateGroupImages as jest.Mock).mockRejectedValue(new Error("Database error"));

      await profileController.updateGroupImages(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    });

    it("Deve lidar com erros sem mensagem (default message)", async () => {
      req = {
        params: { groupId: "group-id" },
        user: { id: "user-id" },
        files: {},
        body: {}
      } as any;

      (profileService.updateGroupImages as jest.Mock).mockRejectedValue({});

      await profileController.updateGroupImages(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: "Erro ao atualizar imagens do grupo" });
    });
  });

  describe("updateUserImages", () => {
    it("Deve atualizar as imagens do usuário corretamente", async () => {
      const authUser = { id: "user-id" };
      const userId = "user-id";

      const mockFiles = {
        profileImage: [{ originalname: "profile.png" }],
        bannerImage: [{ originalname: "banner.png" }]
      };

      req = {
        params: { userId },
        user: authUser,
        files: mockFiles,
        body: { bio: "Nova bio" }
      } as any;

      const mockResult = { message: "Imagens atualizadas com sucesso", user: {} };
      (profileService.updateUserImages as jest.Mock).mockResolvedValue(mockResult);

      await profileController.updateUserImages(req as Request, res as Response);

      expect(profileService.updateUserImages).toHaveBeenCalledWith(
        userId,
        authUser.id,
        mockFiles.profileImage[0],
        mockFiles.bannerImage[0],
        "Nova bio"
      );
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("Deve retornar 400 se o userId não estiver presente", async () => {
      req = {
        params: {},
        user: { id: "user-id" }
      } as any;

      await profileController.updateUserImages(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: "userId é obrigatório" });
      expect(profileService.updateUserImages).not.toHaveBeenCalled();
    });

    it("Deve retornar 401 se o usuário não estiver autenticado", async () => {
      req = {
        params: { userId: "user-id" },
        user: undefined
      } as any;

      await profileController.updateUserImages(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith({ message: "Usuário não autenticado" });
      expect(profileService.updateUserImages).not.toHaveBeenCalled();
    });

    it("Deve retornar 403 se o usuário tentar editar perfil de outro usuário", async () => {
      req = {
        params: { userId: "other-user-id" },
        user: { id: "user-id" }
      } as any;

      await profileController.updateUserImages(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({ message: "Você só pode editar seu próprio perfil" });
      expect(profileService.updateUserImages).not.toHaveBeenCalled();
    });

    it("Deve lidar com atualizações parciais (apenas profile)", async () => {
      const authUser = { id: "user-id" };

      req = {
        params: { userId: "user-id" },
        user: authUser,
        files: {
          profileImage: [{ originalname: "profile.png" }]
        },
        body: {}
      } as any;

      (profileService.updateUserImages as jest.Mock).mockResolvedValue({});

      await profileController.updateUserImages(req as Request, res as Response);

      expect(profileService.updateUserImages).toHaveBeenCalledWith(
        "user-id",
        "user-id",
        expect.anything(),
        undefined,
        undefined
      );
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    });

    it("Deve lidar com atualizações parciais (apenas banner)", async () => {
      const authUser = { id: "user-id" };

      req = {
        params: { userId: "user-id" },
        user: authUser,
        files: {
          bannerImage: [{ originalname: "banner.png" }]
        },
        body: {}
      } as any;

      (profileService.updateUserImages as jest.Mock).mockResolvedValue({});

      await profileController.updateUserImages(req as Request, res as Response);

      expect(profileService.updateUserImages).toHaveBeenCalledWith(
        "user-id",
        "user-id",
        undefined,
        expect.anything(),
        undefined
      );
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    });

    it("Deve lidar com atualizações parciais (apenas bio)", async () => {
      const authUser = { id: "user-id" };

      req = {
        params: { userId: "user-id" },
        user: authUser,
        files: {},
        body: { bio: "Apenas bio nova" }
      } as any;

      (profileService.updateUserImages as jest.Mock).mockResolvedValue({});

      await profileController.updateUserImages(req as Request, res as Response);

      expect(profileService.updateUserImages).toHaveBeenCalledWith(
        "user-id",
        "user-id",
        undefined,
        undefined,
        "Apenas bio nova"
      );
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    });

    it("Deve lidar com erros com status específico", async () => {
      req = {
        params: { userId: "user-id" },
        user: { id: "user-id" },
        files: {},
        body: {}
      } as any;

      const error = { status: httpStatus.BAD_REQUEST, message: "Imagem inválida" };
      (profileService.updateUserImages as jest.Mock).mockRejectedValue(error);

      await profileController.updateUserImages(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: "Imagem inválida" });
    });

    it("Deve lidar com erros sem status (default 500)", async () => {
      req = {
        params: { userId: "user-id" },
        user: { id: "user-id" },
        files: {},
        body: {}
      } as any;

      (profileService.updateUserImages as jest.Mock).mockRejectedValue(new Error("Upload failed"));

      await profileController.updateUserImages(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: "Upload failed" });
    });

    it("Deve lidar com erros sem mensagem (default message)", async () => {
      req = {
        params: { userId: "user-id" },
        user: { id: "user-id" },
        files: {},
        body: {}
      } as any;

      (profileService.updateUserImages as jest.Mock).mockRejectedValue({});

      await profileController.updateUserImages(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: "Erro ao atualizar imagens do usuário" });
    });
  });
});