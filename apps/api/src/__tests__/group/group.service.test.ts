import groupService from "../../modules/group/group.service";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import GroupRepository from "../../modules/group/group.repository";
import followRepository from "../../modules/follow/follow.repository";
import GroupMembershipRepository from "../../modules/groupMembership/groupMembership.repository";
import {
  $Enums,
  Group,
  GroupType,
  VerificationStatus,
} from "@prisma/client/wasm";
import { group } from "console";

jest.mock("../../modules/group/group.repository");
jest.mock("../../modules/groupMembership/groupMembership.repository");
jest.mock("../../modules/follow/follow.repository", () => ({
  findFollow: jest.fn(),
  findGroupsFollowedByUser: jest.fn(),
}));

describe("GroupService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllGroups", () => {
    it("should return an array of groups with default boolean flags (false)", async () => {
      const mockGroups = [
        { id: "1", name: "Group 1" },
        { id: "2", name: "Group 2" },
      ];

      (GroupRepository.findAll as jest.Mock).mockResolvedValue(mockGroups);

      const result = await groupService.getAllGroups();

      const expectedResult = [
        { id: "1", name: "Group 1", isMember: false, isFollowing: false },
        { id: "2", name: "Group 2", isMember: false, isFollowing: false },
      ];

      expect(result).toEqual(expectedResult);
      expect(GroupRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it("should mark isMember as true for groups the user belongs to", async () => {
      const userId = "user-123";
      const mockGroups: Group[] = [
        {
          name: "grupo1",
          id: "id-1",
          description: "descricao1",
          sports: ["esport1", "esport2"],
          groupType: GroupType.AMATEUR,
          acceptingNewMembers: true,
          verificationRequest: true,
          verificationStatus: VerificationStatus.PENDING,
          createdAt: new Date("2025-11-28T21:27:04.691Z"),
          updatedAt: new Date("2025-11-28T21:27:04.691Z"),
          bio: null,
          logoUrl: null,
          bannerUrl: null,
          logoId: null,
          bannerId: null,
        },
        {
          name: "grupo2",
          id: "id-2",
          description: "descricao2",
          sports: ["esport1", "esport2"],
          groupType: GroupType.ATHLETIC,
          acceptingNewMembers: false,
          verificationRequest: false,
          verificationStatus: VerificationStatus.VERIFIED,
          createdAt: new Date("2025-11-28T21:27:04.691Z"),
          updatedAt: new Date("2025-11-28T21:27:04.691Z"),
          bio: null,
          logoUrl: null,
          bannerUrl: null,
          logoId: null,
          bannerId: null,
        },
      ];

      const mockMemberships = [{ groupId: "1", userId: userId }];

      (GroupRepository.findAll as jest.Mock).mockResolvedValue(mockGroups);
      (
        followRepository.findGroupsFollowedByUser as jest.Mock
      ).mockResolvedValue({ groups: mockGroups, totalCount: 0 });
      // Mocka o retorno das inscrições do usuário
      (
        GroupMembershipRepository.findMemberByUserId as jest.Mock
      ).mockResolvedValue(mockMemberships);

      const result = await groupService.getAllGroups(userId);

      const expectedResult = [
        {
          name: "grupo1",
          id: "id-1",
          description: "descricao1",
          sports: ["esport1", "esport2"],
          groupType: GroupType.AMATEUR,
          acceptingNewMembers: true,
          verificationRequest: true,
          isMember: false,
          isFollowing: true,
          verificationStatus: VerificationStatus.PENDING,
          createdAt: new Date("2025-11-28T21:27:04.691Z"),
          updatedAt: new Date("2025-11-28T21:27:04.691Z"),
          bio: null,
          logoUrl: null,
          bannerUrl: null,
          logoId: null,
          bannerId: null,
        },
        {
          name: "grupo2",
          id: "id-2",
          description: "descricao2",
          sports: ["esport1", "esport2"],
          groupType: GroupType.ATHLETIC,
          acceptingNewMembers: false,
          isMember: false,
          isFollowing: true,
          verificationRequest: false,
          verificationStatus: VerificationStatus.VERIFIED,
          createdAt: new Date("2025-11-28T21:27:04.691Z"),
          updatedAt: new Date("2025-11-28T21:27:04.691Z"),
          bio: null,
          logoUrl: null,
          bannerUrl: null,
          logoId: null,
          bannerId: null,
        },
      ];

      expect(result).toEqual(expectedResult);
      expect(GroupMembershipRepository.findMemberByUserId).toHaveBeenCalledWith(
        userId,
      );
    });
  });

  describe("getAllOpenGroups", () => {
    it("should return an array of open groups", async () => {
      const mockOpenGroups = [
        { id: "1", name: "Open Group 1" },
        { id: "2", name: "Open Group 2" },
      ];

      (GroupRepository.findAllOpenGroups as jest.Mock).mockResolvedValue(
        mockOpenGroups,
      );

      const result = await groupService.getAllOpenGroups();

      expect(result).toEqual(mockOpenGroups);
      expect(GroupRepository.findAllOpenGroups).toHaveBeenCalledTimes(1);
    });
  });

  describe("getGroupByName", () => {
    it("should throw an ApiError with NOT_FOUND status if group is not found", async () => {
      (GroupRepository.findGroupByName as jest.Mock).mockResolvedValue(null);

      await expect(
        groupService.getGroupByName("nonexistent-group"),
      ).rejects.toEqual(
        new ApiError(httpStatus.NOT_FOUND, "Grupo não encontrado"),
      );

      expect(GroupRepository.findGroupByName).toHaveBeenCalledWith(
        "nonexistent-group",
      );
    });
  });

  describe("createGroup", () => {
    it("should throw an ApiError with CONFLICT status if group name is already in use", async () => {
      const mockExistingGroup = { id: "group-id", name: "existing-group" };

      (GroupRepository.findGroupByName as jest.Mock).mockResolvedValue(
        mockExistingGroup,
      );

      await expect(
        groupService.createGroup(
          { name: "existing-group", description: "A group" },
          { id: "author-id", name: "Author" },
        ),
      ).rejects.toEqual(
        new ApiError(httpStatus.CONFLICT, "Nome do grupo já está em uso"),
      );

      expect(GroupRepository.findGroupByName).toHaveBeenCalledWith(
        "existing-group",
      );
    });

    it("should set verificationStatus to PENDING if verificationRequest is true", async () => {
      const mockNewGroup = {
        id: "new-group-id",
        name: "new-group",
        description: "A new group",
        verificationRequest: true,
        verificationStatus: "PENDING",
      };

      (GroupRepository.findGroupByName as jest.Mock).mockResolvedValue(null);
      (GroupRepository.createGroup as jest.Mock).mockResolvedValue(
        mockNewGroup,
      );

      const result = await groupService.createGroup(
        {
          name: "new-group",
          description: "A new group",
          verificationRequest: true,
        },
        { id: "author-id", name: "Author" },
      );

      expect(result).toEqual(mockNewGroup);
      expect(GroupRepository.findGroupByName).toHaveBeenCalledWith("new-group");
      expect(GroupRepository.createGroup).toHaveBeenCalledWith(
        {
          name: "new-group",
          description: "A new group",
          verificationRequest: true,
          verificationStatus: "PENDING",
        },
        { id: "author-id", name: "Author" },
      );
    });
  });

  describe("updateGroup", () => {
    it("should throw an ApiError with NOT_FOUND status if user is not a member of the group", async () => {
      const mockGroup = { id: "group-id", name: "existing-group" };

      (GroupRepository.findGroupByName as jest.Mock).mockResolvedValue(
        mockGroup,
      );
      (
        GroupMembershipRepository.findMemberByUserIdAndGroupId as jest.Mock
      ).mockResolvedValue(null);

      await expect(
        groupService.updateGroup(
          { description: "New description" },
          "user-id",
          "existing-group",
        ),
      ).rejects.toEqual(
        new ApiError(httpStatus.NOT_FOUND, "Usuário não faz parte do grupo"),
      );

      expect(GroupRepository.findGroupByName).toHaveBeenCalledWith(
        "existing-group",
      );
      expect(
        GroupMembershipRepository.findMemberByUserIdAndGroupId,
      ).toHaveBeenCalledWith("user-id", "group-id");
    });

    it("should throw an ApiError with NOT_FOUND status if group is not found", async () => {
      (GroupRepository.findGroupByName as jest.Mock).mockResolvedValue(null);

      await expect(
        groupService.updateGroup(
          { description: "New description" },
          "user-id",
          "nonexistent-group",
        ),
      ).rejects.toEqual(
        new ApiError(httpStatus.NOT_FOUND, "Grupo não encontrado"),
      );

      expect(GroupRepository.findGroupByName).toHaveBeenCalledWith(
        "nonexistent-group",
      );
    });

    it("should update the group", async () => {
      const mockGroup = {
        name: "string",
        id: "string",
        description: "string",
        groupType: "AMADOR" as $Enums.GroupType,
        verificationRequest: false,
        verificationStatus: null,
        acceptingNewMembers: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMember = {
        id: "string",
        createdAt: new Date(),
        userId: "string",
        groupId: "string",
        role: "ADMIN" as $Enums.GroupRole,
        isCreator: true,
      };

      (GroupRepository.findGroupByName as jest.Mock).mockResolvedValue(
        mockGroup,
      );
      (
        GroupMembershipRepository.findMemberByUserIdAndGroupId as jest.Mock
      ).mockResolvedValue(mockMember);
      (GroupRepository.updateGroup as jest.Mock).mockResolvedValue(mockGroup);

      const result = await groupService.updateGroup(
        { description: "New description" },
        "user-id",
        "existing-group",
      );

      expect(result).toEqual(mockGroup);
      expect(GroupRepository.findGroupByName).toHaveBeenCalledWith(
        "existing-group",
      );
      expect(
        GroupMembershipRepository.findMemberByUserIdAndGroupId,
      ).toHaveBeenCalledWith("user-id", "string");
      expect(GroupRepository.updateGroup).toHaveBeenCalledWith(
        { description: "New description" },
        "string",
      );
    });
  });

  describe("deleteGroup", () => {
    it("should delete the group", async () => {
      const groupId = "group-id";
      const userId = "user-id";

      (GroupRepository.findGroupByName as jest.Mock).mockResolvedValue({
        id: groupId,
        name: "Group Name",
        description: "Group Description",
        groupType: "AMADOR" as $Enums.GroupType,
        verificationRequest: false,
        verificationStatus: null,
        acceptingNewMembers: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (
        GroupMembershipRepository.findMemberByUserIdAndGroupId as jest.Mock
      ).mockResolvedValue({
        id: "membership-id",
        createdAt: new Date(),
        userId: userId,
        groupId: groupId,
        role: "ADMIN" as $Enums.GroupRole,
        isCreator: true,
      });
      (GroupRepository.deleteGroup as jest.Mock).mockResolvedValue(void 0);

      await groupService.deleteGroup(userId, groupId);

      expect(GroupRepository.deleteGroup).toHaveBeenCalledWith(groupId);
    });

    it("should throw an ApiError with NOT_FOUND status if group is not found", async () => {
      (GroupRepository.findGroupByName as jest.Mock).mockResolvedValue(null);

      await expect(
        groupService.deleteGroup("user-id", "nonexistent-group"),
      ).rejects.toEqual(
        new ApiError(httpStatus.NOT_FOUND, "Grupo não encontrado"),
      );

      expect(GroupRepository.findGroupByName).toHaveBeenCalledWith(
        "nonexistent-group",
      );
    });

    it("should throw an ApiError with NOT_FOUND status if user is not a member of the group", async () => {
      const mockGroup = { id: "group-id", name: "Group Name" };

      (GroupRepository.findGroupByName as jest.Mock).mockResolvedValue(
        mockGroup,
      );
      (
        GroupMembershipRepository.findMemberByUserIdAndGroupId as jest.Mock
      ).mockResolvedValue(null);

      await expect(
        groupService.deleteGroup("user-id", "Group Name"),
      ).rejects.toEqual(
        new ApiError(httpStatus.NOT_FOUND, "Usuário não faz parte do grupo"),
      );

      expect(GroupRepository.findGroupByName).toHaveBeenCalledWith(
        "Group Name",
      );
      expect(
        GroupMembershipRepository.findMemberByUserIdAndGroupId,
      ).toHaveBeenCalledWith("user-id", "group-id");
    });

    it("should throw an ApiError with FORBIDDEN status if user is not a member of the group", async () => {
      const mockGroup = { id: "group-id", name: "Group Name" };
      const mockMember = { id: "membership-id", role: "MEMBER" };

      (GroupRepository.findGroupByName as jest.Mock).mockResolvedValue(
        mockGroup,
      );
      (
        GroupMembershipRepository.findMemberByUserIdAndGroupId as jest.Mock
      ).mockResolvedValue(mockMember);

      await expect(
        groupService.deleteGroup("user-id", "Group Name"),
      ).rejects.toEqual(
        new ApiError(
          httpStatus.FORBIDDEN,
          "Usuário não possui permissão para editar o grupo",
        ),
      );

      expect(GroupRepository.findGroupByName).toHaveBeenCalledWith(
        "Group Name",
      );
      expect(
        GroupMembershipRepository.findMemberByUserIdAndGroupId,
      ).toHaveBeenCalledWith("user-id", "group-id");
    });
  });
});
