import groupMembershipService from "../../modules/groupMembership/groupMembership.service";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import groupMembershipRepository from "../../modules/groupMembership/groupMembership.repository";
import { GroupRole } from "@prisma/client";

jest.mock("../../modules/groupMembership/groupMembership.repository");

describe("GroupMembershipService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAllMembers", () => {
    it("Deve retornar uma lista com todos os membros existentes", async () => {
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

      (groupMembershipRepository.findAllMembers as jest.Mock).mockResolvedValue(
        mockMembers,
      );

      const members = await groupMembershipService.findAllMembers();

      expect(members).toEqual(mockMembers);
      expect(groupMembershipRepository.findAllMembers).toHaveBeenCalled();
    });
  });

  describe("findMemberById", () => {
    it("Deve retornar um membro a partir de seu id", async () => {
      const mockMember = {
        id: "M1",
        userId: "U1",
        groupId: "G1",
        role: GroupRole.ADMIN,
        isCreator: true,
        createdAt: new Date("2023-01-01T00:00:00Z"),
      };
      (groupMembershipRepository.findMemberById as jest.Mock).mockResolvedValue(
        mockMember,
      );

      const member = await groupMembershipService.findMemberById("M1");

      expect(member).toEqual(mockMember);
      expect(groupMembershipRepository.findMemberById).toHaveBeenCalledWith(
        "M1",
      );
    });
  });

  describe("findMemberByUserId", () => {
    it("Deve retornar uma lista com todos os membros com base em um userId", async () => {
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
      (
        groupMembershipRepository.findMemberByUserId as jest.Mock
      ).mockResolvedValue(mockMembers);

      const members = await groupMembershipService.findMemberByUserId("U1");

      expect(members).toEqual(mockMembers);
      expect(groupMembershipRepository.findMemberByUserId).toHaveBeenCalledWith(
        "U1",
      );
    });
  });

  describe("findAdminMemberByUserId", () => {
    it("Deve retornar uma lista com todos os Admin com base em um userId", async () => {
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
      (
        groupMembershipRepository.findAdminMemberByUserId as jest.Mock
      ).mockResolvedValue(mockMembers);

      const members = await groupMembershipService.findAdminMemberByUserId("U1");

      expect(members).toEqual(mockMembers);
      expect(groupMembershipRepository.findAdminMemberByUserId).toHaveBeenCalledWith(
        "U1",
      );
    });
  });

  describe("findMemberByGroupId", () => {
    it("Deve retornar uma lista com todos os membros com base em um groupId", async () => {
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
      (
        groupMembershipRepository.findMemberByGroupId as jest.Mock
      ).mockResolvedValue(mockMembers);

      const members = await groupMembershipService.findMemberByGroupId("G1");

      expect(members).toEqual(mockMembers);
      expect(
        groupMembershipRepository.findMemberByGroupId,
      ).toHaveBeenCalledWith("G1");
    });
  });

  describe("findMemberByUserIdAndGroupId", () => {
    it("Deve retornar uma lista com todos os membros com base em um userId e um groupId", async () => {
      const mockMember = {
        id: "M1",
        userId: "U1",
        groupId: "G1",
        role: GroupRole.ADMIN,
        isCreator: true,
        createdAt: new Date("2023-01-01T00:00:00Z"),
      };
      (
        groupMembershipRepository.findMemberByUserIdAndGroupId as jest.Mock
      ).mockResolvedValue(mockMember);

      const members = await groupMembershipService.findMemberByUserIdAndGroupId(
        "U1",
        "G1",
      );

      expect(members).toEqual(mockMember);
      expect(
        groupMembershipRepository.findMemberByUserIdAndGroupId,
      ).toHaveBeenCalledWith("U1", "G1");
    });
  });

  describe("createMembership", () => {
    it("Deve criar e retornar um objeto membro", async () => {
      const mockMemberData = {
        userId: "U1",
        groupId: "G1",
      };
      const mockCreatedMember = {
        id: "M1",
        userId: "U1",
        groupId: "G1",
        role: GroupRole.MEMBER,
        isCreator: false,
        createdAt: new Date("2023-01-01T00:00:00Z"),
      };

      (
        groupMembershipRepository.findMemberByUserIdAndGroupId as jest.Mock
      ).mockResolvedValue(null);
      (
        groupMembershipRepository.createMembership as jest.Mock
      ).mockResolvedValue(mockCreatedMember);

      const newMember =
        await groupMembershipService.createMembership(mockMemberData);

      expect(newMember).toEqual(mockCreatedMember);
      expect(groupMembershipRepository.createMembership).toHaveBeenCalledWith(
        {},
        mockMemberData.userId,
        mockMemberData.groupId,
      );
    });

    it("Deve jogar um ApiError se o usuário já for membro do grupo", async () => {
      const mockMemberData = {
        userId: "U1",
        groupId: "G1",
      };

      const mockExistingMember = {
        id: "M1",
        userId: "U1",
        groupId: "G1",
        role: GroupRole.MEMBER,
        isCreator: false,
        createdAt: new Date("2023-01-01T00:00:00Z"),
      };

      (
        groupMembershipRepository.findMemberByUserIdAndGroupId as jest.Mock
      ).mockResolvedValue(mockExistingMember);
      await expect(
        groupMembershipService.createMembership(mockMemberData),
      ).rejects.toThrow(ApiError);

      await expect(
        groupMembershipService.createMembership(mockMemberData),
      ).rejects.toMatchObject({
        statusCode: httpStatus.CONFLICT,
        message: "Usuário já é membro do grupo",
      });

      expect(
        groupMembershipRepository.findMemberByUserIdAndGroupId,
      ).toHaveBeenCalledWith("U1", "G1");
    });
  });

  describe("updateInvite", () => {
    it("Deve atualizar e retornar o objeto membro", async () => {
      const mockMemberNewData = {
        role: GroupRole.ADMIN,
      };
      const mockUpdatedMember = {
        id: "M1",
        userId: "U1",
        groupId: "G1",
        role: GroupRole.ADMIN,
        isCreator: false,
        createdAt: new Date("2023-01-01T00:00:00Z"),
      };

      (groupMembershipRepository.updateMember as jest.Mock).mockResolvedValue(
        mockUpdatedMember,
      );

      const updatedMember = await groupMembershipService.updateMembership(
        mockMemberNewData,
        "U1",
      );

      expect(updatedMember).toEqual(mockUpdatedMember);
      expect(groupMembershipRepository.updateMember).toHaveBeenCalledWith(
        mockMemberNewData,
        "U1",
      );
    });
  });

  describe("deleteInvite", () => {
    it("Deve excluir o objeto membro", async () => {
      (groupMembershipRepository.deleteMember as jest.Mock).mockResolvedValue(
        undefined,
      );

      await expect(
        groupMembershipService.deleteMembership("U1"),
      ).resolves.toBeUndefined();

      expect(groupMembershipRepository.deleteMember).toHaveBeenCalledWith("U1");
    });
  });
});
