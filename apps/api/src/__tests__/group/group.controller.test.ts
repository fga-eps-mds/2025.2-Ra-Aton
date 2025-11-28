import type { Request, Response } from "express";
import HttpStatus from "http-status";
import { userService } from "../../modules/user/user.service";
import GroupService from "../../modules/group/group.service";
import { ApiError } from "../../utils/ApiError";
import GroupController from "../../modules/group/group.controller";

jest.mock("../../modules/group/group.service");
jest.mock("../../modules/user/user.service");

describe("CommentController", () => {
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

      req = {};

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

      req = {};

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
      };

      await GroupController.getGroupByName(req as Request, res as Response);

      expect(GroupService.getGroupByName).toHaveBeenCalledWith("Group 1", undefined);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.FOUND);
      expect(res.json).toHaveBeenCalledWith(groupWithDetails);
    });

    it("should pass userId to service when user is authenticated", async () => {
      const groupWithDetails = { id: "1", name: "Group 1", isFollowing: true };
      (GroupService.getGroupByName as jest.Mock).mockResolvedValue(groupWithDetails);

      req = {
        params: { name: "Group 1" },
        user: { id: "user-123" }
      } as any;

      await GroupController.getGroupByName(req as Request, res as Response);

      expect(GroupService.getGroupByName).toHaveBeenCalledWith("Group 1", "user-123");
      expect(res.status).toHaveBeenCalledWith(HttpStatus.FOUND);
      expect(res.json).toHaveBeenCalledWith(groupWithDetails);
    });

    it("should return 404 if group name is not provided", async () => {
      req = {
        params: {},
      };

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
      } as Partial<Request>;

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
        user: null,
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
      } as Partial<Request>;

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
      } as Partial<Request>;

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
        user: null,
        params: { name: "Existing Group" },
        body: { name: "Updated Group" },
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
      } as Partial<Request>;

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
      } as Partial<Request>;

      await GroupController.deleteGroup(req as Request, res as Response);

      expect(GroupService.deleteGroup).toHaveBeenCalledWith("user1", groupName);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });

    it("should return 401 if user is not authorized", async () => {
      req = {
        user: null,
        params: { name: "Existing Group" },
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
      } as Partial<Request>;

      await GroupController.deleteGroup(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        message: "Nome do grupo é obrigatorio",
      });
    });
  });
});
