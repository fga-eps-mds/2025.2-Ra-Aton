import groupMembershipService from "../../modules/groupMembership/groupMembership.service";
import httpStatus from "http-status";
import { Response, Request } from "express";
import groupMembershipController from "../../modules/groupMembership/groupMembership.controller";
import { GroupRole } from "@prisma/client";

jest.mock("../../modules/groupMembership/groupMembership.service");

describe("GroupMembershipController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAllInvites", () => {
    it("Deve retornar todos os convites com status 200", async () => {
      const mockMembers = [
        {
          id: "M1",
          userId: "U1",
          groupId: "G1",
          role: GroupRole.ADMIN,
          isCreator: true,
          createdAt: new Date("2023-01-01T00:00:00Z"),
        },
        {
          id: "M2",
          userId: "U2",
          groupId: "G2",
          role: GroupRole.MEMBER,
          isCreator: false,
          createdAt: new Date("2023-02-01T00:00:00Z"),
        },
      ];

      (groupMembershipService.findAllMembers as jest.Mock).mockResolvedValue(
        mockMembers,
      );

      await groupMembershipController.listAllMembers(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockMembers);
    });
  });

  describe("findMemberById", () => {
    it("Deve retornar um objeto membro a partir de seu id e com status 200", async () => {
      const mockMember = {
        id: "M1",
        userId: "U1",
        groupId: "G1",
        role: GroupRole.ADMIN,
        isCreator: true,
        createdAt: new Date("2023-01-01T00:00:00Z"),
      };
      req.params = { id: "M1" };
      (groupMembershipService.findMemberById as jest.Mock).mockResolvedValue(
        mockMember,
      );

      await groupMembershipController.findMemberById(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockMember);
    });

    it("Deve retornar 400 caso o id não for recebido", async () => {
      req.params = {};

      await groupMembershipController.findMemberById(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID do convite é obrigatario",
      });
    });
  });

  describe("listAllMemberByUserId", () => {
    it("Deve retornar uma lista com todos os membros com base em um userId e o status 200", async () => {
      const mockMembers = [
        {
          id: "M1",
          userId: "U1",
          groupId: "G1",
          role: GroupRole.ADMIN,
          isCreator: true,
          createdAt: new Date("2023-01-01T00:00:00Z"),
        },
        {
          id: "M2",
          userId: "U2",
          groupId: "G2",
          role: GroupRole.MEMBER,
          isCreator: false,
          createdAt: new Date("2023-02-01T00:00:00Z"),
        },
      ];

      req.params = { id: "U1" };
      (
        groupMembershipService.findMemberByUserId as jest.Mock
      ).mockResolvedValue(mockMembers);

      await groupMembershipController.listAllMembersByUserId(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockMembers);
    });
    it("Deve retornar 400 caso o id não seja fornecido", async () => {
      req.params = {};

      await groupMembershipController.listAllMembersByUserId(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID do usuário é obrigatório",
      });
    });
  });

  describe("listAllMembersFromGroupId", () => {
    it("Deve retornar uma lista com todos os membros com base em um groupId e o status 200", async () => {
      const mockInvites = [{ id: "1" }, { id: "2" }];
      req.params = { id: "group1", sender: "SENDER" };
      (
        groupMembershipService.findMemberByGroupId as jest.Mock
      ).mockResolvedValue(mockInvites);

      await groupMembershipController.listAllMembersFromGroupId(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockInvites);
    });
    it("Deve retornar 400 caso o id não seja fornecido", async () => {
      req.params = {};

      await groupMembershipController.listAllMembersFromGroupId(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID do grupo é obrigatório",
      });
    });
  });

  describe("createMember", () => {
    it("Deve criar e retornar um novo membro com o status 201", async () => {
      const mockCreatedMember = {
        id: "M1",
        userId: "U1",
        groupId: "G1",
        role: GroupRole.MEMBER,
        isCreator: false,
        createdAt: new Date("2023-01-01T00:00:00Z"),
      };
      req.body = { userId: "U1", groupId: "G1" };
      (groupMembershipService.createMembership as jest.Mock).mockResolvedValue(
        mockCreatedMember,
      );

      await groupMembershipController.createMembership(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(mockCreatedMember);
    });
  });

  describe("updateMember", () => {
    it("Deve atualizar e retornar o membro atulizado com o status 200", async () => {
      const mockUpdatedMember = {
        id: "M1",
        userId: "U1",
        groupId: "G1",
        role: GroupRole.ADMIN,
        isCreator: false,
        createdAt: new Date("2023-01-01T00:00:00Z"),
      };
      req.params = { id: "1" };
      req.body = { role: GroupRole.ADMIN };

      (groupMembershipService.updateMembership as jest.Mock).mockResolvedValue(
        mockUpdatedMember,
      );

      await groupMembershipController.updateMember(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedMember);
    });

    it("Deve retornar 400 caso o id não seja fornecido", async () => {
      req.params = {};
      req.body = { role: GroupRole.ADMIN };

      await groupMembershipController.updateMember(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID do membro é obrigatório",
      });
    });
  });

  describe("deleteMember", () => {
    it("Deve deletar o membro e retornar com status 204", async () => {
      req.params = { id: "U1" };

      await groupMembershipController.deleteMember(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });

    it("Deve retornar 400 caso o id não seja fornecido", async () => {
      req.params = {};

      await groupMembershipController.deleteMember(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID do membro é obrigatório",
      });
    });
  });
});
