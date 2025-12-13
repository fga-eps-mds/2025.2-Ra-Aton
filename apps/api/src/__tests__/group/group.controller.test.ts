import type { Request, Response } from "express";
import HttpStatus from "http-status";
import { userService } from "../../modules/user/user.service";
import GroupService from "../../modules/group/group.service";
import GroupController from "../../modules/group/group.controller";
import jwt from "jsonwebtoken";
import { ApiError } from "../../utils/ApiError";

jest.mock("../../modules/group/group.service");
jest.mock("../../modules/user/user.service");
jest.mock("jsonwebtoken");

describe("GroupController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    sendMock = jest.fn().mockReturnThis();

    res = {
      status: statusMock,
      json: jsonMock,
      send: sendMock,
    };
  });

  describe("listGroups", () => {
    it("deve listar grupos sem userId se o header de auth não for enviado", async () => {
      const groups = [{ id: "1", name: "Group 1" }];
      (GroupService.getAllGroups as jest.Mock).mockResolvedValue(groups);

      req = { headers: {} } as Partial<Request>;

      await GroupController.listGroups(req as Request, res as Response);

      expect(GroupService.getAllGroups).toHaveBeenCalledWith(undefined);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(groups);
    });

    it("deve extrair userId do token JWT e passar para o serviço", async () => {
      const groups = [{ id: "1", name: "Group 1" }];
      (GroupService.getAllGroups as jest.Mock).mockResolvedValue(groups);
      (jwt.verify as jest.Mock).mockReturnValue({ id: "user123" });

      req = {
        headers: { authorization: "Bearer token-valido" },
      } as Partial<Request>;

      await GroupController.listGroups(req as Request, res as Response);

      expect(jwt.verify).toHaveBeenCalled();
      expect(GroupService.getAllGroups).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it("deve ignorar erro de token inválido (catch silencioso) e chamar serviço com userId undefined", async () => {
      (GroupService.getAllGroups as jest.Mock).mockResolvedValue([]);
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      req = {
        headers: { authorization: "Bearer token-invalido" },
      } as Partial<Request>;

      await GroupController.listGroups(req as Request, res as Response);

      expect(GroupService.getAllGroups).toHaveBeenCalledWith(undefined);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it("deve ignorar token se o payload decodificado não tiver id", async () => {
      (GroupService.getAllGroups as jest.Mock).mockResolvedValue([]);
      (jwt.verify as jest.Mock).mockReturnValue({ role: "admin" });

      req = {
        headers: { authorization: "Bearer token-sem-id" },
      } as Partial<Request>;

      await GroupController.listGroups(req as Request, res as Response);

      expect(GroupService.getAllGroups).toHaveBeenCalledWith(undefined);
    });
  });

  describe("listOpenGroups", () => {
    it("deve retornar lista de grupos abertos", async () => {
      const openGroups = [{ id: "2", name: "Open Group", isPrivate: false }];
      (GroupService.getAllOpenGroups as jest.Mock).mockResolvedValue(openGroups);

      req = {};

      await GroupController.listOpenGroups(req as Request, res as Response);

      expect(GroupService.getAllOpenGroups).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(openGroups);
    });
  });

  describe("getGroupByName", () => {
    it("deve retornar 404 se o nome do grupo não for fornecido", async () => {
      req = { params: {} };

      await GroupController.getGroupByName(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        message: "Nome do grupo é obrigatorio",
      });
    });

    it("deve buscar grupo pelo nome (com autenticação opcional funcionando)", async () => {
      const mockGroup = { id: "1", name: "Grupo Teste" };
      (GroupService.getGroupByName as jest.Mock).mockResolvedValue(mockGroup);
      (jwt.verify as jest.Mock).mockReturnValue({ id: "user1" });

      req = {
        params: { name: "Grupo Teste" },
        headers: { authorization: "Bearer token" },
      } as any;

      await GroupController.getGroupByName(req as Request, res as Response);

      expect(GroupService.getGroupByName).toHaveBeenCalledWith(
        "Grupo Teste",
        "user1"
      );
      expect(res.status).toHaveBeenCalledWith(302); 
      expect(res.json).toHaveBeenCalledWith(mockGroup);
    });

    it("deve buscar grupo pelo nome mesmo se token for inválido (catch silencioso)", async () => {
      const mockGroup = { id: "1", name: "Grupo Teste" };
      (GroupService.getGroupByName as jest.Mock).mockResolvedValue(mockGroup);
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Erro JWT");
      });

      req = {
        params: { name: "Grupo Teste" },
        headers: { authorization: "Bearer bad-token" },
      } as any;

      await GroupController.getGroupByName(req as Request, res as Response);

      expect(GroupService.getGroupByName).toHaveBeenCalledWith(
        "Grupo Teste",
        undefined
      );
      expect(res.status).toHaveBeenCalledWith(302);
    });
  });

  describe("createGroup", () => {
    it("deve retornar 401 se usuário não estiver autenticado (req.user undefined)", async () => {
      req = { body: { name: "Novo Grupo" } } as Request;

      await GroupController.createGroup(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith({
        message: "Não foi possivel autorizar o usuário",
      });
    });

    it("deve retornar 404 se o usuário do req.user não for encontrado no banco", async () => {
      req = {
        body: { name: "Novo Grupo" },
        user: { id: "user-fantasma" },
      } as any;

      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await GroupController.createGroup(req as Request, res as Response);

      expect(userService.getUserById).toHaveBeenCalledWith("user-fantasma");
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        message: "Autor da postagem não encotrado",
      });
    });

    it("deve criar grupo com sucesso (201)", async () => {
      const user = { id: "user1", name: "User" };
      const newGroup = { id: "g1", name: "Novo Grupo", authorId: "user1" };

      req = {
        body: { name: "Novo Grupo" },
        user: { id: "user1" },
      } as any;

      (userService.getUserById as jest.Mock).mockResolvedValue(user);
      (GroupService.createGroup as jest.Mock).mockResolvedValue(newGroup);

      await GroupController.createGroup(req as Request, res as Response);

      expect(GroupService.createGroup).toHaveBeenCalledWith(
        { name: "Novo Grupo" },
        user
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(newGroup);
    });

    it("deve propagar ApiError se ocorrer erro de negócio (sem try/catch no controller)", async () => {
      req = { body: {}, user: { id: "u1" } } as any;
      (userService.getUserById as jest.Mock).mockResolvedValue({ id: "u1" });
      
      const apiError = new ApiError(HttpStatus.BAD_REQUEST, "Nome inválido");
      (GroupService.createGroup as jest.Mock).mockRejectedValue(apiError);

      await expect(
        GroupController.createGroup(req as Request, res as Response)
      ).rejects.toBe(apiError);
    });

    it("deve propagar erro genérico (sem try/catch no controller)", async () => {
      req = { body: {}, user: { id: "u1" } } as any;
      (userService.getUserById as jest.Mock).mockResolvedValue({ id: "u1" });
      
      const genericError = new Error("Crash");
      (GroupService.createGroup as jest.Mock).mockRejectedValue(genericError);

      await expect(
        GroupController.createGroup(req as Request, res as Response)
      ).rejects.toThrow("Crash");
    });
  });

  describe("updateGroup", () => {
    it("deve retornar 401 se usuário não autenticado", async () => {
      req = { params: { name: "g1" } } as any;
      await GroupController.updateGroup(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    });

    it("deve retornar 404 se nome do grupo não for informado", async () => {
      req = { user: { id: "u1" }, params: {} } as any;
      await GroupController.updateGroup(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        message: "Nome do grupo é obrigatorio",
      });
    });

    it("deve atualizar grupo com sucesso", async () => {
      req = {
        user: { id: "u1" },
        params: { name: "GrupoAntigo" },
        body: { name: "NovoNome" },
      } as any;
      
      const updated = { id: "g1", name: "NovoNome" };
      (GroupService.updateGroup as jest.Mock).mockResolvedValue(updated);

      await GroupController.updateGroup(req as Request, res as Response);

      expect(GroupService.updateGroup).toHaveBeenCalledWith(
        { name: "NovoNome" },
        "u1",
        "GrupoAntigo"
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it("deve lidar com ApiError no update", async () => {
      req = { user: { id: "u1" }, params: { name: "G" }, body: {} } as any;
      (GroupService.updateGroup as jest.Mock).mockRejectedValue(
        new ApiError(HttpStatus.FORBIDDEN, "Sem permissão")
      );

      await GroupController.updateGroup(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({ message: "Sem permissão" });
    });

    it("deve lidar com erro genérico no update (500)", async () => {
      req = { user: { id: "u1" }, params: { name: "G" }, body: {} } as any;
      (GroupService.updateGroup as jest.Mock).mockRejectedValue(new Error("Erro DB"));

      await GroupController.updateGroup(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        message: "não foi possível atualizar o grupo",
      });
    });
  });

  describe("deleteGroup", () => {
    it("deve deletar grupo com sucesso", async () => {
      const authUser = { id: "user1" };
      const groupName = "Existing Group";

      req = {
        user: authUser,
        params: { name: groupName },
        headers: {},
      } as any;

      (GroupService.deleteGroup as jest.Mock).mockResolvedValue(undefined);

      await GroupController.deleteGroup(req as Request, res as Response);

      expect(GroupService.deleteGroup).toHaveBeenCalledWith("user1", groupName);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });

    it("deve retornar 401 se usuário não autorizado", async () => {
      req = {
        user: undefined,
        params: { name: "Existing Group" },
      } as Partial<Request>;

      await GroupController.deleteGroup(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith({
        message: "Não foi possivel autorizar o usuário",
      });
    });

    it("deve retornar 404 se nome do grupo não fornecido", async () => {
      const authUser = { id: "user1" };
      req = {
        user: authUser,
        params: {},
      } as any;

      await GroupController.deleteGroup(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        message: "Nome do grupo é obrigatorio",
      });
    });

    it("deve lidar com ApiError no delete", async () => {
        const authUser = { id: "user1" };
        req = { user: authUser, params: { name: "G" } } as any;
        
        (GroupService.deleteGroup as jest.Mock).mockRejectedValue(
          new ApiError(HttpStatus.NOT_FOUND, "Grupo não existe")
        );
  
        await GroupController.deleteGroup(req as Request, res as Response);
  
        expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
        expect(res.json).toHaveBeenCalledWith({ message: "Grupo não existe" });
      });
  
      it("deve lidar com erro genérico no delete (500)", async () => {
        const authUser = { id: "user1" };
        req = { user: authUser, params: { name: "G" } } as any;
        
        (GroupService.deleteGroup as jest.Mock).mockRejectedValue(new Error("Crash"));
  
        await GroupController.deleteGroup(req as Request, res as Response);
  
        expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({
            message: "não foi possível excluir o grupo",
        });
      });
  });
});