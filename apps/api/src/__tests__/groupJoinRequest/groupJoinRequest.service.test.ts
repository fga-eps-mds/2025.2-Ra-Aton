import groupJoinRequestService, {
  parseMadeBy,
} from "../../modules/groupJoinRequest/groupJoinRequest.service";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import groupJoinRequestRepository from "../../modules/groupJoinRequest/groupJoinRequest.repository";
import groupMembershipRepository from "../../modules/groupMembership/groupMembership.repository";
import { parse } from "path";

jest.mock("../../modules/groupJoinRequest/groupJoinRequest.repository");
jest.mock("../../modules/groupMembership/groupMembership.repository");

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

      expect(groupJoinRequestRepository.findInviteById).toHaveBeenCalledWith(
        "nonexistent-id",
      );
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
      expect(groupJoinRequestRepository.findAll).toHaveBeenCalled();
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
        { id: "1", userId: "user1", groupId: "group1", madeBy: "SENDER" },
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

      const result =
        await groupJoinRequestService.findInviteByGroupId("group1");

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
    it("should create and return new invite", async () => {
      const mockInviteData = {
        userId: "user1",
        groupId: "group1",
        madeBy: "USER",
      };
      const mockCreatedInvite = {
        id: "1",
        ...mockInviteData,
      };

      (
        groupMembershipRepository.findMemberByUserIdAndGroupId as jest.Mock
      ).mockResolvedValue(null);
      (
        groupJoinRequestRepository.findInviteByUserAndGroupId as jest.Mock
      ).mockResolvedValue(null);
      (groupJoinRequestRepository.createInvite as jest.Mock).mockResolvedValue(
        mockCreatedInvite,
      );

      const result = await groupJoinRequestService.createInvite(mockInviteData);

      expect(result).toEqual(mockCreatedInvite);
      expect(groupJoinRequestRepository.createInvite).toHaveBeenCalledWith(
        { madeBy: mockInviteData.madeBy },
        mockInviteData.userId,
        mockInviteData.groupId,
      );
    });

    it("should throw ApiError if user is already a group member", async () => {
      const mockInviteData = {
        userId: "user1",
        groupId: "group1",
        madeBy: "USER",
      };
      const mockExistingMember = {
        id: "member1",
        userId: "user1",
        groupId: "group1",
      };

      (
        groupMembershipRepository.findMemberByUserIdAndGroupId as jest.Mock
      ).mockResolvedValue(mockExistingMember);

      await expect(
        groupJoinRequestService.createInvite(mockInviteData),
      ).rejects.toThrow(ApiError);

      await expect(
        groupJoinRequestService.createInvite(mockInviteData),
      ).rejects.toMatchObject({
        statusCode: httpStatus.CONFLICT,
        message: "Usuário já é membro do grupo",
      });

      expect(
        groupMembershipRepository.findMemberByUserIdAndGroupId,
      ).toHaveBeenCalledWith("user1", "group1");
    });

    it("should throw ApiError if an invite already exists", async () => {
      const mockInviteData = {
        userId: "user1",
        groupId: "group1",
        madeBy: "USER",
      };
      const mockExistingInvite = {
        id: "invite1",
        userId: "user1",
        groupId: "group1",
      };

      (
        groupMembershipRepository.findMemberByUserIdAndGroupId as jest.Mock
      ).mockResolvedValue(null);
      (
        groupJoinRequestRepository.findInviteByUserAndGroupId as jest.Mock
      ).mockResolvedValue(mockExistingInvite);

      await expect(
        groupJoinRequestService.createInvite(mockInviteData),
      ).rejects.toThrow(ApiError);

      await expect(
        groupJoinRequestService.createInvite(mockInviteData),
      ).rejects.toMatchObject({
        statusCode: httpStatus.CONFLICT,
        message: "Usuário já foi convidado para equipe recentemente",
      });

      expect(
        groupJoinRequestRepository.findInviteByUserAndGroupId,
      ).toHaveBeenCalledWith("user1", "group1");
    });
  });

  describe("updateInvite", () => {
    it("should update and return invite", async () => {
      const mockInviteData = { status: "APPROVED" };
      const mockUpdatedInvite = {
        id: "1",
        ...mockInviteData,
      };

      (groupJoinRequestRepository.updateInvite as jest.Mock).mockResolvedValue(
        mockUpdatedInvite,
      );

      const result = await groupJoinRequestService.updateInvite(
        mockInviteData,
        "1",
      );

      expect(result).toEqual(mockUpdatedInvite);
      expect(groupJoinRequestRepository.updateInvite).toHaveBeenCalledWith(
        mockInviteData,
        "1",
      );
    });
  });

  describe("parseMadeBy", () => {
    it("should return undefined for undefined sender", () => {
      const result = parseMadeBy(undefined);
      expect(result).toBeUndefined();
    });

    it("should return 'USER' for sender 'USER'", () => {
      const result = parseMadeBy("USER");
      expect(result).toBe("USER");
    });

    it("should return 'GROUP' for sender 'GROUP'", () => {
      const result = parseMadeBy("GROUP");
      expect(result).toBe("GROUP");
    });

    it("should return undefined for invalid sender", () => {
      const result = parseMadeBy("INVALID");
      expect(result).toBeUndefined();
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
