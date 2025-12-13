import groupJoinRequestService, {
  parseMadeBy,
} from "../../modules/groupJoinRequest/groupJoinRequest.service";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import groupJoinRequestRepository from "../../modules/groupJoinRequest/groupJoinRequest.repository";
import groupMembershipRepository from "../../modules/groupMembership/groupMembership.repository";
import groupRepository from "../../modules/group/group.repository";
import notificationService from "../../modules/notification/notification.service";
import { userService } from "../../modules/user/user.service";
import { MadeBy, NotificationType } from "@prisma/client";

jest.mock("../../modules/groupJoinRequest/groupJoinRequest.repository");
jest.mock("../../modules/groupMembership/groupMembership.repository");
jest.mock("../../modules/group/group.repository");
jest.mock("../../modules/notification/notification.service");
jest.mock("../../modules/user/user.service");

describe("GroupJoinRequestService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findInviteById", () => {
    it("should return invite when found", async () => {
      const mockInvite = { id: "1", userId: "user1", groupId: "group1" };
      (
        groupJoinRequestRepository.findInviteById as jest.Mock
      ).mockResolvedValue(mockInvite);

      const result = await groupJoinRequestService.findInviteById("1");

      expect(result).toEqual(mockInvite);
      expect(groupJoinRequestRepository.findInviteById).toHaveBeenCalledWith(
        "1",
      );
    });

    it("should throw ApiError when invite not found", async () => {
      (
        groupJoinRequestRepository.findInviteById as jest.Mock
      ).mockResolvedValue(null);

      await expect(
        groupJoinRequestService.findInviteById("nonexistent-id"),
      ).rejects.toThrow(ApiError);

      await expect(
        groupJoinRequestService.findInviteById("nonexistent-id"),
      ).rejects.toMatchObject({
        statusCode: httpStatus.NOT_FOUND,
        message: "Convite não encontrado",
      });
    });
  });

  describe("findAllInvites", () => {
    it("should return all invites", async () => {
      const mockInvites = [
        { id: "1", userId: "user1", groupId: "group1" },
        { id: "2", userId: "user2", groupId: "group2" },
      ];
      (groupJoinRequestRepository.findAll as jest.Mock).mockResolvedValue(
        mockInvites,
      );

      const result = await groupJoinRequestService.findAllInvites();

      expect(result).toEqual(mockInvites);
    });
  });

  describe("findInviteByUserId", () => {
    it("should return invites for given userId without madeBy filter", async () => {
      const mockInvites = [
        { id: "1", userId: "user1", groupId: "group1" },
        { id: "2", userId: "user1", groupId: "group2" },
      ];
      (
        groupJoinRequestRepository.findInviteByUserId as jest.Mock
      ).mockResolvedValue(mockInvites);

      const result = await groupJoinRequestService.findInviteByUserId("user1");

      expect(result).toEqual(mockInvites);
      expect(
        groupJoinRequestRepository.findInviteByUserId,
      ).toHaveBeenCalledWith("user1", undefined);
    });

    it("should return invites for given userId with madeBy filter", async () => {
      const mockInvites = [
        { id: "1", userId: "user1", groupId: "group1", madeBy: "USER" },
      ];
      (
        groupJoinRequestRepository.findInviteByUserId as jest.Mock
      ).mockResolvedValue(mockInvites);

      const result = await groupJoinRequestService.findInviteByUserId(
        "user1",
        "USER",
      );

      expect(result).toEqual(mockInvites);
      expect(
        groupJoinRequestRepository.findInviteByUserId,
      ).toHaveBeenCalledWith("user1", "USER");
    });
  });

  describe("findInviteByGroupId", () => {
    it("should return invites for given groupId without madeBy filter", async () => {
      const mockInvites = [
        { id: "1", userId: "user1", groupId: "group1" },
        { id: "2", userId: "user2", groupId: "group1" },
      ];
      (
        groupJoinRequestRepository.findInviteByGroupId as jest.Mock
      ).mockResolvedValue(mockInvites);

      const result = await groupJoinRequestService.findInviteByGroupId("group1");

      expect(result).toEqual(mockInvites);
      expect(
        groupJoinRequestRepository.findInviteByGroupId,
      ).toHaveBeenCalledWith("group1", undefined);
    });

    it("should return invites for given groupId with madeBy filter", async () => {
      const mockInvites = [
        { id: "1", userId: "user1", groupId: "group1", madeBy: "USER" },
      ];
      (
        groupJoinRequestRepository.findInviteByGroupId as jest.Mock
      ).mockResolvedValue(mockInvites);

      const result = await groupJoinRequestService.findInviteByGroupId(
        "group1",
        "USER",
      );

      expect(result).toEqual(mockInvites);
      expect(
        groupJoinRequestRepository.findInviteByGroupId,
      ).toHaveBeenCalledWith("group1", "USER");
    });
  });

  describe("createInvite", () => {
    it("should create invite and notify admins when made by USER", async () => {
      const mockInviteData = {
        userId: "user1",
        groupId: "group1",
        madeBy: "USER",
      };
      
      const mockCreatedInvite = {
        id: "1",
        ...mockInviteData,
        madeBy: MadeBy.USER
      };

      const mockGroup = { id: "group1", name: "Grupo Teste" };
      const mockUser = { id: "user1", userName: "UserTest" };
      const mockAdmins = [{ userId: "admin1" }, { userId: "admin2" }];

      (groupMembershipRepository.findMemberByUserIdAndGroupId as jest.Mock).mockResolvedValue(null);
      (groupJoinRequestRepository.findInviteByUserAndGroupId as jest.Mock).mockResolvedValue(null);
      (groupJoinRequestRepository.createInvite as jest.Mock).mockResolvedValue(mockCreatedInvite);
      (groupRepository.findGroupById as jest.Mock).mockResolvedValue(mockGroup);
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (groupMembershipRepository.findAdminsByGroupId as jest.Mock).mockResolvedValue(mockAdmins);
      (notificationService.send as jest.Mock).mockResolvedValue(undefined);

      const result = await groupJoinRequestService.createInvite(mockInviteData);

      expect(result).toEqual(mockCreatedInvite);
      
      expect(groupJoinRequestRepository.createInvite).toHaveBeenCalledWith(
        { madeBy: "USER" },
        "user1",
        "group1"
      );

      expect(groupMembershipRepository.findAdminsByGroupId).toHaveBeenCalledWith("group1");
      
      expect(notificationService.send).toHaveBeenCalledTimes(2);
      expect(notificationService.send).toHaveBeenCalledWith(
        "admin1",
        NotificationType.GROUP_JOIN_REQUEST,
        expect.any(String),
        expect.stringContaining("UserTest"),
        "group1",
        "GROUP",
        "1"
      );
    });

    it("should throw ApiError if user is already a group member", async () => {
      const mockInviteData = { userId: "user1", groupId: "group1" };
      (groupMembershipRepository.findMemberByUserIdAndGroupId as jest.Mock).mockResolvedValue({ id: "1" });

      await expect(groupJoinRequestService.createInvite(mockInviteData))
        .rejects.toMatchObject({ statusCode: httpStatus.CONFLICT });
    });

    it("should throw ApiError if an invite already exists", async () => {
      const mockInviteData = { userId: "user1", groupId: "group1" };
      (groupMembershipRepository.findMemberByUserIdAndGroupId as jest.Mock).mockResolvedValue(null);
      (groupJoinRequestRepository.findInviteByUserAndGroupId as jest.Mock).mockResolvedValue({ id: "1" });

      await expect(groupJoinRequestService.createInvite(mockInviteData))
        .rejects.toMatchObject({ statusCode: httpStatus.CONFLICT });
    });
  });

  describe("updateInvite", () => {
    it("should update invite, create membership and notify user on APPROVE", async () => {
      const mockInviteData = { status: "APPROVED" };
      const mockUpdatedInvite = {
        id: "1",
        userId: "user1",
        groupId: "group1",
        ...mockInviteData,
      };
      const mockGroup = { id: "group1", name: "Grupo Teste" };

      (groupJoinRequestRepository.updateInvite as jest.Mock).mockResolvedValue(mockUpdatedInvite);
      (groupRepository.findGroupById as jest.Mock).mockResolvedValue(mockGroup);
      (groupMembershipRepository.createMembership as jest.Mock).mockResolvedValue({});
      (notificationService.send as jest.Mock).mockResolvedValue(undefined);

      const result = await groupJoinRequestService.updateInvite(mockInviteData, "1");

      expect(result).toEqual(mockUpdatedInvite);
      expect(groupMembershipRepository.createMembership).toHaveBeenCalled();
      
      expect(notificationService.send).toHaveBeenCalledWith(
        "user1",
        NotificationType.GROUP_JOIN_APPROVED,
        expect.stringContaining("Aprovada"),
        expect.stringContaining("Grupo Teste"),
        "group1",
        "GROUP",
        "1"
      );
    });

    it("should update invite and notify user on REJECT", async () => {
      const mockInviteData = { status: "REJECTED" };
      const mockUpdatedInvite = {
        id: "1",
        userId: "user1",
        groupId: "group1",
        ...mockInviteData,
      };
      const mockGroup = { id: "group1", name: "Grupo Teste" };

      (groupJoinRequestRepository.updateInvite as jest.Mock).mockResolvedValue(mockUpdatedInvite);
      (groupRepository.findGroupById as jest.Mock).mockResolvedValue(mockGroup);
      (notificationService.send as jest.Mock).mockResolvedValue(undefined);

      await groupJoinRequestService.updateInvite(mockInviteData, "1");

      expect(notificationService.send).toHaveBeenCalledWith(
        "user1",
        NotificationType.GROUP_JOIN_REJECTED,
        expect.stringContaining("Rejeitada"),
        expect.stringContaining("Grupo Teste"),
        "group1",
        "GROUP",
        "1"
      );
      
      expect(groupMembershipRepository.createMembership).not.toHaveBeenCalled();
    });
  });

  describe("parseMadeBy", () => {
    it("should return undefined for undefined sender", () => {
      expect(parseMadeBy(undefined)).toBeUndefined();
    });

    it("should return 'USER' for sender 'USER'", () => {
      expect(parseMadeBy("USER")).toBe("USER");
    });

    it("should return 'GROUP' for sender 'GROUP'", () => {
      expect(parseMadeBy("GROUP")).toBe("GROUP");
    });

    it("should return undefined for invalid sender", () => {
      expect(parseMadeBy("INVALID")).toBeUndefined();
    });
  });

  describe("deleteInvite", () => {
    it("should delete invite without errors", async () => {
      (groupJoinRequestRepository.deleteInvite as jest.Mock).mockResolvedValue(
        undefined,
      );

      await expect(
        groupJoinRequestService.deleteInvite("1"),
      ).resolves.toBeUndefined();

      expect(groupJoinRequestRepository.deleteInvite).toHaveBeenCalledWith("1");
    });
  });
});