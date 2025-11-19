import groupJoinRequestController from "../../modules/groupJoinRequest/groupJoinRequest.controller";
import HttpStatus from "http-status";
import { Response, Request } from "express";
import GroupJoinRequestService from "../../modules/groupJoinRequest/groupJoinRequest.service";

jest.mock("../../modules/groupJoinRequest/groupJoinRequest.service");

describe("GroupJoinRequestController", () => {
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
    it("should return all invites with status 200", async () => {
      const mockInvites = [{ id: "1" }, { id: "2" }];
      (GroupJoinRequestService.findAllInvites as jest.Mock).mockResolvedValue(
        mockInvites,
      );

      await groupJoinRequestController.findAllInvites(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockInvites);
    });
  });

  describe("findInviteById", () => {
    it("should return invite by ID with status 200", async () => {
      const mockInvite = { id: "1" };
      req.params = { id: "1" };
      (GroupJoinRequestService.findInviteById as jest.Mock).mockResolvedValue(
        mockInvite,
      );

      await groupJoinRequestController.findInviteById(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockInvite);
    });

    it("should return 400 if ID is not provided", async () => {
      req.params = {};

      await groupJoinRequestController.findInviteById(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID do convite é obrigatario",
      });
    });
  });

  describe("findAllByUserId", () => {
    it("should return invites by user ID with status 200", async () => {
      const mockInvites = [{ id: "1" }, { id: "2" }];
      req.params = { id: "user1", sender: "SENDER" };
      (
        GroupJoinRequestService.findInviteByUserId as jest.Mock
      ).mockResolvedValue(mockInvites);

      await groupJoinRequestController.findAllByUserId(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockInvites);
    });
    it("should return 400 if user ID is not provided", async () => {
      req.params = { sender: "SENDER" };

      await groupJoinRequestController.findAllByUserId(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID do usuário é obrigatario",
      });
    });
  });

  describe("findAllByGroupId", () => {
    it("should return invites by group ID with status 200", async () => {
      const mockInvites = [{ id: "1" }, { id: "2" }];
      req.params = { id: "group1", sender: "SENDER" };
      (
        GroupJoinRequestService.findInviteByGroupId as jest.Mock
      ).mockResolvedValue(mockInvites);

      await groupJoinRequestController.findAllByGroupId(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockInvites);
    });
    it("should return 400 if group ID is not provided", async () => {
      req.params = { sender: "SENDER" };

      await groupJoinRequestController.findAllByGroupId(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID do grupo é obrigatario",
      });
    });
  });

  describe("createInvite", () => {
    it("should create a new invite with status 201", async () => {
      const mockNewInvite = { id: "1" };
      req.body = { userId: "user1", groupId: "group1" };
      (GroupJoinRequestService.createInvite as jest.Mock).mockResolvedValue(
        mockNewInvite,
      );

      await groupJoinRequestController.createInvite(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(mockNewInvite);
    });
  });

  describe("updateInvite", () => {
    it("should update an invite with status 200", async () => {
      const mockUpdatedInvite = { id: "1" };
      req.params = { id: "1" };
      req.body = { status: "APPROVED" };

      (GroupJoinRequestService.updateInvite as jest.Mock).mockResolvedValue(
        mockUpdatedInvite,
      );

      await groupJoinRequestController.updateInvite(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        updateInvite: mockUpdatedInvite,
      });
    });

    it("should return 400 if invite ID is not provided", async () => {
      req.params = {};
      req.body = { status: "APPROVED" };

      await groupJoinRequestController.updateInvite(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID do convite é obrigatario",
      });
    });
  });

  describe("deleteInvite", () => {
    it("should delete an invite with status 204", async () => {
      req.params = { id: "1" };

      await groupJoinRequestController.deleteInvite(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });

    it("should return 400 if invite ID is not provided", async () => {
      req.params = {};

      await groupJoinRequestController.deleteInvite(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "ID do convite é obrigatario",
      });
    });
  });
});
