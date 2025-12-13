import { Request, Response } from "express";
import httpStatus from "http-status";
import { GroupRole } from "@prisma/client";
import groupMembershipController from "../../modules/groupMembership/groupMembership.controller";
import groupMembershipService from "../../modules/groupMembership/groupMembership.service";
import { ApiError } from "../../utils/ApiError";

jest.mock("../../modules/groupMembership/groupMembership.service");

describe("GroupMembershipController", () => {
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
    req = {};
  });

  describe("listAllMembers", () => {
    it("Deve retornar todos os convites com status 200", async () => {
      const mockMembers = [
        {
          id: "M1",
          userId: "U1",
          groupId: "G1",
          role: GroupRole.ADMIN,
          isCreator: true,
          createdAt: new Date(),
        },
      ];

      (groupMembershipService.findAllMembers as jest.Mock).mockResolvedValue(mockMembers);

      await groupMembershipController.listAllMembers(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockMembers);
    });
  });

  describe("findMemberById", () => {
    it("Deve retornar 400 caso o id não for recebido", async () => {
      req.params = {};

      await groupMembershipController.findMemberById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID do convite é obrigatario",
      });
    });

    it("Deve retornar um objeto membro a partir de seu id e com status 200", async () => {
      const mockMember = { id: "M1", role: GroupRole.ADMIN };
      req.params = { id: "M1" };
      (groupMembershipService.findMemberById as jest.Mock).mockResolvedValue(mockMember);

      await groupMembershipController.findMemberById(req as Request, res as Response);

      expect(groupMembershipService.findMemberById).toHaveBeenCalledWith("M1");
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockMember);
    });
  });

  describe("listAllMembersByUserId", () => {
    it("Deve retornar 400 caso o id não seja fornecido", async () => {
      req.params = {};

      await groupMembershipController.listAllMembersByUserId(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID do usuário é obrigatório",
      });
    });

    it("Deve retornar uma lista com todos os membros com base em um userId e o status 200", async () => {
      const mockMembers = [{ id: "M1", userId: "U1" }];
      req.params = { id: "U1" };
      (groupMembershipService.findMemberByUserId as jest.Mock).mockResolvedValue(mockMembers);

      await groupMembershipController.listAllMembersByUserId(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockMembers);
    });
  });

  describe("listAllAdminMembersByUserId", () => {
    it("Deve retornar 400 caso o id não seja fornecido", async () => {
      req.params = {};

      await groupMembershipController.listAllAdminMembersByUserId(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID do usuário é obrigatório",
      });
    });

    it("Deve retornar uma lista com todos os Admins com base em um userId e o status 200", async () => {
      const mockMembers = [{ id: "M1", role: GroupRole.ADMIN }];
      req.params = { id: "U1" };
      (groupMembershipService.findAdminMemberByUserId as jest.Mock).mockResolvedValue(mockMembers);

      await groupMembershipController.listAllAdminMembersByUserId(req as Request, res as Response);

      expect(groupMembershipService.findAdminMemberByUserId).toHaveBeenCalledWith("U1");
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockMembers);
    });
  });

  describe("listAllMembersFromGroupId", () => {
    it("Deve retornar 400 caso o id não seja fornecido", async () => {
      req.params = {};

      await groupMembershipController.listAllMembersFromGroupId(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID do grupo é obrigatório",
      });
    });

    it("Deve retornar uma lista com todos os membros com base em um groupId e o status 200", async () => {
      const mockInvites = [{ id: "1" }];
      req.params = { id: "group1" };
      
      (groupMembershipService.findMemberByGroupId as jest.Mock).mockResolvedValue(mockInvites);

      await groupMembershipController.listAllMembersFromGroupId(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockInvites);
    });
  });

  describe("createMembership", () => {
    it("Deve criar e retornar um novo membro com o status 201", async () => {
      const mockCreatedMember = { id: "M1", role: GroupRole.MEMBER };
      req.body = { userId: "U1", groupId: "G1" };
      (groupMembershipService.createMembership as jest.Mock).mockResolvedValue(mockCreatedMember);
      
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await groupMembershipController.createMembership(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(mockCreatedMember);
      
      logSpy.mockRestore();
    });
  });

  describe("updateMember", () => {
    it("Deve retornar 400 caso o id não seja fornecido", async () => {
      req.params = {};
      req.body = { role: GroupRole.ADMIN };

      await groupMembershipController.updateMember(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID do membro é obrigatório",
      });
    });

    it("Deve atualizar e retornar o membro atualizado com o status 200", async () => {
      const mockUpdatedMember = { id: "M1", role: GroupRole.ADMIN };
      req.params = { id: "M1" };
      req.body = { role: GroupRole.ADMIN };

      (groupMembershipService.updateMembership as jest.Mock).mockResolvedValue(mockUpdatedMember);

      await groupMembershipController.updateMember(req as Request, res as Response);

      expect(groupMembershipService.updateMembership).toHaveBeenCalledWith({ role: GroupRole.ADMIN }, "M1");
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedMember);
    });

    it("Deve capturar ApiError e retornar o status correto", async () => {
      const error = new ApiError(httpStatus.NOT_FOUND, "Membro não encontrado");
      req.params = { id: "M1" };
      req.body = {};
      
      (groupMembershipService.updateMembership as jest.Mock).mockRejectedValue(error);

      await groupMembershipController.updateMember(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: "Membro não encontrado" });
    });

    it("Deve capturar erro genérico e retornar 500", async () => {
      const error = new Error("DB Crash");
      req.params = { id: "M1" };
      req.body = {};
      
      (groupMembershipService.updateMembership as jest.Mock).mockRejectedValue(error);

      await groupMembershipController.updateMember(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: "Erro ao atualizar membro" });
    });
  });

  describe("deleteMember", () => {
    it("Deve retornar 400 caso o id não seja fornecido", async () => {
      req.params = {};

      await groupMembershipController.deleteMember(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID do membro é obrigatório",
      });
    });

    it("Deve deletar o membro e retornar com status 204", async () => {
      req.params = { id: "U1" };
      (groupMembershipService.deleteMembership as jest.Mock).mockResolvedValue(undefined);

      await groupMembershipController.deleteMember(req as Request, res as Response);

      expect(groupMembershipService.deleteMembership).toHaveBeenCalledWith("U1");
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });

    it("Deve capturar ApiError e retornar o status correto", async () => {
      const error = new ApiError(httpStatus.FORBIDDEN, "Não permitido");
      req.params = { id: "U1" };
      
      (groupMembershipService.deleteMembership as jest.Mock).mockRejectedValue(error);

      await groupMembershipController.deleteMember(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({ message: "Não permitido" });
    });

    it("Deve capturar erro genérico e retornar 500", async () => {
      const error = new Error("DB Crash");
      req.params = { id: "U1" };
      
      (groupMembershipService.deleteMembership as jest.Mock).mockRejectedValue(error);

      await groupMembershipController.deleteMember(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: "Erro ao excluir membro" });
    });
  });
});