import { prismaMock } from "../prisma-mock";
import groupMembershipRepository from "../../modules/groupMembership/groupMembership.repository";
import { GroupMembership, GroupRole, Prisma } from "@prisma/client";

describe("GroupMembershipRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  beforeEach(async () => {
    await prismaMock.groupMembership.deleteMany();
    await prismaMock.group.deleteMany();
    await prismaMock.user.deleteMany();
  });
  afterAll(async () => {
    await prismaMock.$disconnect();
  });

  describe("findAllMembers", () => {
    it("deve retornar todos os membros", async () => {
      const membersData = [
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
      prismaMock.groupMembership.findMany.mockResolvedValue(
        membersData as GroupMembership[],
      );

      const members = await groupMembershipRepository.findAllMembers();

      expect(members).toHaveLength(2);
      expect(members[0]).toBe(membersData[0]);
      expect(members[1]).toBe(membersData[1]);
      expect(prismaMock.groupMembership.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("findMemberById", () => {
    it("deve retornar um membro específico pelo id", async () => {
      const memberData = {
        id: "M1",
        userId: "U1",
        groupId: "G1",
        role: GroupRole.ADMIN,
        isCreator: true,
        createdAt: new Date("2023-01-01T00:00:00Z"),
      };
      prismaMock.groupMembership.findUnique.mockResolvedValueOnce(
        memberData as GroupMembership,
      );

      const member = await groupMembershipRepository.findMemberById("M1");

      expect(member).toEqual(memberData);
      expect(prismaMock.groupMembership.findUnique).toHaveBeenCalledWith({
        where: { id: "M1" },
        include: {
          user: {
            select: { id: true, userName: true, email: true },
          },
          group: true,
        },
      });
      expect(prismaMock.groupMembership.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe("findMemberByUserId", () => {
    it("deve retornar todos os convites de um determinado usuário a partir de seu userId", async () => {
      const mockMembers: GroupMembership[] = [
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
      prismaMock.groupMembership.findMany.mockResolvedValue(mockMembers);

      const members = await groupMembershipRepository.findMemberByUserId("U1");
      expect(members).toEqual(mockMembers);
      expect(prismaMock.groupMembership.findMany).toHaveBeenCalledWith({
        where: { userId: "U1" },
        include: {
          user: {
            select: { id: true, userName: true, email: true },
          },
          group: true,
        },
      });
    });
  });

  describe("findMemberByGroupId", () => {
    it("deve retornar todos os convites de um determinado grupo a partir de seu userId", async () => {
      const mockMembers: GroupMembership[] = [
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
      prismaMock.groupMembership.findMany.mockResolvedValue(mockMembers);

      const members = await groupMembershipRepository.findMemberByGroupId("G1");
      expect(members).toEqual(mockMembers);
      expect(prismaMock.groupMembership.findMany).toHaveBeenCalledWith({
        where: { groupId: "G1" },
        include: {
          user: {
            select: { id: true, userName: true, email: true },
          },
          group: true,
        },
      });
    });
  });

  describe("findMemberByUserIdAndGroupId", () => {
    it("deve retornar o convite de um determinado membro a partir de seu userId e groupId", async () => {
      const mockMember: GroupMembership = {
        id: "M1",
        userId: "U1",
        groupId: "G1",
        role: GroupRole.ADMIN,
        isCreator: true,
        createdAt: new Date("2023-01-01T00:00:00Z"),
      };
      prismaMock.groupMembership.findUnique.mockResolvedValue(mockMember);

      const member =
        await groupMembershipRepository.findMemberByUserIdAndGroupId(
          "U1",
          "G1",
        );
      expect(member).toEqual(mockMember);
      expect(prismaMock.groupMembership.findUnique).toHaveBeenCalledWith({
        where: { userId_groupId: { userId: "U1", groupId: "G1" } },
        include: {
          user: {
            select: { id: true, userName: true, email: true },
          },
          group: true,
        },
      });
    });
  });

  describe("createMember", () => {
    it("Deve criar e retornar o novo membro", async () => {
      const mockMemberData: Prisma.GroupMembershipCreateInput = {
        user: {
          connect: { id: "user1" },
        },
        group: {
          connect: { id: "group1" },
        },
      };

      const mockCreatedMember: GroupMembership = {
        id: "M1",
        userId: "U1",
        groupId: "G2",
        role: GroupRole.MEMBER,
        isCreator: false,
        createdAt: new Date(),
      };

      prismaMock.groupMembership.create.mockResolvedValue(mockCreatedMember);
      const newMember = await groupMembershipRepository.createMembership(
        mockMemberData,
        "U1",
        "G1",
      );

      expect(newMember).toEqual(mockCreatedMember);
      expect(prismaMock.groupMembership.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.groupMembership.create).toHaveBeenCalledWith({
        data: {
          user: {
            connect: { id: "U1" },
          },
          group: {
            connect: { id: "G1" },
          },
        },
        include: {
          user: {
            select: { id: true, userName: true, email: true },
          },
          group: true,
        },
      });
    });
  });

  describe("updateMember", () => {
    it("Deve atualizar e retornar o novo membro", async () => {
      const mockUpdatedMemberData: Prisma.GroupMembershipUpdateInput = {
        role: GroupRole.ADMIN,
      };

      const mockUpdatedMember: GroupMembership = {
        id: "M1",
        userId: "U1",
        groupId: "G2",
        role: GroupRole.ADMIN,
        isCreator: false,
        createdAt: new Date(),
      };

      prismaMock.groupMembership.update.mockResolvedValue(mockUpdatedMember);
      const updatedMember = await groupMembershipRepository.updateMember(
        mockUpdatedMemberData,
        "M1",
      );

      expect(updatedMember).toEqual(mockUpdatedMember);
      expect(prismaMock.groupMembership.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.groupMembership.update).toHaveBeenCalledWith({
        where: { id: "M1" },
        data: mockUpdatedMemberData,
      });
    });
  });

  describe("deleteMember", () => {
    it("deve excluir um membro a partir de seu id", async () => {
      prismaMock.groupMembership.delete.mockResolvedValue({} as any);
      await groupMembershipRepository.deleteMember("M1");

      expect(prismaMock.groupMembership.delete).toHaveBeenCalledWith({
        where: { id: "M1" },
      });
    });
  });
});
