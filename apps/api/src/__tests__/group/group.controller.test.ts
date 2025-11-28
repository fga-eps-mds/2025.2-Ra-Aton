import type { Request, Response } from "express";
import HttpStatus from "http-status";
import { userService } from "../../modules/user/user.service";
import GroupService from "../../modules/group/group.service";
import GroupController from "../../modules/group/group.controller";
import jwt from "jsonwebtoken";

// Mocks
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
    it("should return a list of groups", async () => {
      const groups = [{ id: "1", name: "Group 1" }];

      (GroupService.getAllGroups as jest.Mock).mockResolvedValue(groups);

      req = {
        headers: {},
      } as Partial<Request>;

      await GroupController.listGroups(req as Request, res as Response);

      expect(GroupService.getAllGroups).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(groups);
    });

    it("Should return a list of open groups", async () => {
      const groups = [
        { id: "1", name: "Open Group 1" },
        { id: "2", name: "Open Group 2" },
      ];

      (GroupService.getAllOpenGroups as jest.Mock).mockResolvedValue(groups);

      req = {
        headers: {},
      } as Partial<Request>;

      await GroupController.listOpenGroups(req as Request, res as Response);

      expect(GroupService.getAllOpenGroups).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(groups);
    });

    it("should return a group by name including isFollowing status", async () => {
      const groupWithDetails = { id: "1", name: "Group 1", isFollowing: false };

      (GroupService.getGroupByName as jest.Mock).mockResolvedValue(groupWithDetails);

      req = {
        params: { name: "Group 1" },
        headers: {},
      } as Partial<Request>;

      await GroupController.getGroupByName(req as Request, res as Response);

      expect(GroupService.getGroupByName).toHaveBeenCalledWith("Group 1", undefined);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.FOUND);
      expect(res.json).toHaveBeenCalledWith(groupWithDetails);
    });

    it("should pass userId to service when user is authenticated via Token", async () => {
      const groupWithDetails = { id: "1", name: "Group 1", isFollowing: true };
      
      // Configura o mock do Service
      (GroupService.getGroupByName as jest.Mock).mockResolvedValue(groupWithDetails);
      

      (jwt.verify as jest.Mock).mockReturnValue({ id: "user-123" });


      req = {
        params: { name: "Group 1" },
        headers: {
          authorization: "Bearer valid_token_mock",
        },
      } as Partial<Request>;

      await GroupController.getGroupByName(req as Request, res as Response);

      expect(GroupService.getGroupByName).toHaveBeenCalledWith("Group 1", "user-123");
      expect(res.status).toHaveBeenCalledWith(HttpStatus.FOUND);
      expect(res.json).toHaveBeenCalledWith(groupWithDetails);
    });

    it("should return 404 if group name is not provided", async () => {
      req = {
        params: {},
        headers: {},
      } as Partial<Request>;

      await GroupController.getGroupByName(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        message: "Nome do grupo é obrigatorio",
      });
    });
  });

  describe("createGroup", () => {
    it("should create a new group", async () => {
      const authUser = { id: "user1" };
      const author = { id: "user1", name: "Author" };
      const newGroupData = { name: "New Group" };
      const createdGroup = { id: "group1", name: "New Group" };

      req = {
        user: authUser,
        body: newGroupData,
        headers: {},
      } as any;

      (userService.getUserById as jest.Mock).mockResolvedValue(author);
      (GroupService.createGroup as jest.Mock).mockResolvedValue(createdGroup);

      await GroupController.createGroup(req as Request, res as Response);

      expect(userService.getUserById).toHaveBeenCalledWith("user1");
      expect(GroupService.createGroup).toHaveBeenCalledWith(
        newGroupData,
        author,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(createdGroup);
    });

    it("should return 401 if user is not authorized", async () => {
      req = {
        user: undefined,
        headers: {},
      } as Partial<Request>;

      await GroupController.createGroup(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith({
        message: "Não foi possivel autorizar o usuário",
      });
    });

    it("should return 404 if author is not found", async () => {
      const authUser = { id: "user1" };

      req = {
        user: authUser,
        body: { name: "New Group" },
        headers: {},
      } as any;

      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await GroupController.createGroup(req as Request, res as Response);

      expect(userService.getUserById).toHaveBeenCalledWith("user1");
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        message: "Autor da postagem não encotrado",
      });
    });
  });

  describe("updateGroup", () => {
    it("should update an existing group", async () => {
      const authUser = { id: "user1" };
      const groupName = "Existing Group";
      const updateData = { name: "Updated Group" };
      const updatedGroup = { id: "group1", name: "Updated Group" };

      req = {
        user: authUser,
        params: { name: groupName },
        body: updateData,
        headers: {},
      } as any;

      (GroupService.updateGroup as jest.Mock).mockResolvedValue(updatedGroup);

      await GroupController.updateGroup(req as Request, res as Response);

      expect(GroupService.updateGroup).toHaveBeenCalledWith(
        updateData,
        "user1",
        groupName,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(updatedGroup);
    });

    it("should return 401 if user is not authorized", async () => {
      req = {
        user: undefined,
        params: { name: "Existing Group" },
        body: { name: "Updated Group" },
        headers: {},
      } as Partial<Request>;

      await GroupController.updateGroup(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith({
        message: "Não foi possivel autorizar o usuário",
      });
    });

    it("should return 404 if group name is not provided", async () => {
      const authUser = { id: "user1" };

      req = {
        user: authUser,
        params: {},
        body: { name: "Updated Group" },
        headers: {},
      } as any;

      await GroupController.updateGroup(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        message: "Nome do grupo é obrigatorio",
      });
    });
  });

  describe("deleteGroup", () => {
    it("should delete an existing group", async () => {
      const authUser = { id: "user1" };
      const groupName = "Existing Group";

      req = {
        user: authUser,
        params: { name: groupName },
        headers: {},
      } as any;

      await GroupController.deleteGroup(req as Request, res as Response);

      expect(GroupService.deleteGroup).toHaveBeenCalledWith("user1", groupName);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });

    it("should return 401 if user is not authorized", async () => {
      req = {
        user: undefined,
        params: { name: "Existing Group" },
        headers: {},
      } as Partial<Request>;

      await GroupController.deleteGroup(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith({
        message: "Não foi possivel autorizar o usuário",
      });
    });

    it("should return 404 if group name is not provided", async () => {
      const authUser = { id: "user1" };

      req = {
        user: authUser,
        params: {},
        headers: {},
      } as any;

      await GroupController.deleteGroup(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        message: "Nome do grupo é obrigatorio",
      });
    });
  });
});
