import { prismaMock } from "../prisma-mock";
import { GroupType, Group, ProfileType, User, Prisma } from "@prisma/client";

jest.resetModules();

const prismaStub = {
  group: {
    create: prismaMock.group.create,
    update: prismaMock.group.update,
    findMany: prismaMock.group.findMany,
    findUnique: prismaMock.group.findUnique,
    delete: prismaMock.group.delete,
    count: prismaMock.group.count,
    deleteMany: prismaMock.group.deleteMany,
  },
  groupMembership: {
    create: prismaMock.groupMembership.create,
    findUnique: prismaMock.groupMembership.findUnique,
    update: prismaMock.groupMembership.update,
    delete: prismaMock.groupMembership.delete,
    deleteMany: prismaMock.groupMembership.deleteMany,
  },
  // Support both forms of $transaction used by the repository:
  // - function callback: prisma.$transaction(async (tx) => { ... })
  // - array form: prisma.$transaction([prisma.match.findMany(...), prisma.match.count()])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $transaction: jest.fn().mockImplementation(async (arg: any) => {
    if (Array.isArray(arg)) {
      // assume items are promises from prisma mock functions
      return Promise.all(arg);
    }
    // Execute the callback function with prismaStub as tx and return its result
    return await arg(prismaStub);
  }),
};

// Import the repository class and instantiate it with our stubbed prisma
import { GroupRepository } from "../../modules/group/group.repository";
const repository = new GroupRepository(prismaStub as any);

describe("Group Repository", () => {
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

  describe("findAll", () => {
    it("should return all groups ordered by createdAt descending", async () => {
      prismaMock.group.findMany.mockResolvedValueOnce([
        {
          id: "1",
          name: "Group 1",
          acceptingNewMembers: true,
          createdAt: new Date("2023-01-01T00:00:00Z"),
          updatedAt: new Date("2023-01-01T00:00:00Z"),
        },
        {
          id: "2",
          name: "Group 2",
          acceptingNewMembers: false,
          createdAt: new Date("2023-02-01T00:00:00Z"),
          updatedAt: new Date("2023-02-01T00:00:00Z"),
        },
      ] as Group[]);

      const groups = await repository.findAll();

      const group1 = groups[0];
      const group2 = groups[1];
      expect(groups).toHaveLength(2);
      expect(groups[1]?.id).toBe(group2?.id);
      expect(groups[0]?.id).toBe(group1?.id);
    });
  });

  describe("findAllOpenGroups", () => {
    it("should return all open groups ordered by createdAt descending", async () => {
      prismaMock.group.findMany.mockResolvedValueOnce([
        {
          id: "1",
          name: "Open Group 1",
          acceptingNewMembers: true,
          createdAt: new Date("2023-03-01T00:00:00Z"),
          updatedAt: new Date("2023-03-01T00:00:00Z"),
        },
        {
          id: "2",
          name: "Open Group 2",
          acceptingNewMembers: true,
          createdAt: new Date("2023-04-01T00:00:00Z"),
          updatedAt: new Date("2023-04-01T00:00:00Z"),
        },
      ] as Group[]);

      const openGroups = await repository.findAllOpenGroups();

      const openGroup1 = openGroups[0];
      const openGroup2 = openGroups[1];
      expect(openGroups).toHaveLength(2);
      expect(openGroups[1]?.id).toBe(openGroup2?.id);
      expect(openGroups[0]?.id).toBe(openGroup1?.id);
      expect(openGroups.every((group) => group.acceptingNewMembers)).toBe(true);
    });
  });

  describe("findGroupByName", () => {
    it("should return a group by its name", async () => {
      const groupData = {
        id: "1",
        name: "Unique Group",
        acceptingNewMembers: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaMock.group.findUnique.mockResolvedValueOnce(groupData as Group);

      const group = await repository.findGroupByName("Unique Group");
      expect(group).toEqual(groupData);
      expect(prismaMock.group.findUnique).toHaveBeenCalledWith({
        where: { name: "Unique Group" },
        include: {
          _count: {
            select: { memberships: true },
          },
          memberships: {
            orderBy: { createdAt: "asc" },
            include: {
              user: {
                select: {
                  id: true,
                  userName: true,
                  email: true,
                },
              },
            },
          },
        },
      });
      expect(prismaMock.group.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe("createGroup", () => {
    it("should create a new group", async () => {
      const groupToBeCreated: Prisma.GroupCreateInput = {
        name: "New Group",
        acceptingNewMembers: true,
      };

      const groupData: Group = {
        id: "1",
        name: "New Group",
        description: null,
        verificationRequest: false,
        sports: [],
        groupType: "AMATEUR" as GroupType,
        acceptingNewMembers: true,
        verificationStatus: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const author: User = {
        name: "",
        id: "author1",
        profileType: ProfileType.JOGADOR,
        userName: "authorUser",
        email: "email",
        passwordHash: "hash",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.group.create.mockResolvedValueOnce(groupData as Group);
      prismaMock.groupMembership.create.mockResolvedValueOnce({
        userId: author.id,
        groupId: groupData.id,
        role: "ADMIN",
        isCreator: true,
      } as any);

      const newGroup = await repository.createGroup(groupToBeCreated, author);

      expect(newGroup).toEqual(groupData);

      expect(prismaMock.group.create).toHaveBeenCalledWith({
        data: groupToBeCreated,
      });
      expect(prismaMock.groupMembership.create).toHaveBeenCalledWith({
        data: {
          userId: author.id,
          groupId: groupData.id,
          role: "ADMIN",
          isCreator: true,
        },
      });
    });
  });

  describe("updateGroup", () => {
    it("should update a group", async () => {
      const groupId = "1";
      const groupData: Prisma.GroupUpdateInput = {
        name: "Group",
      };

      const group: Group = {
        id: groupId,
        name: "updated Group",
        description: null,
        verificationRequest: false,
        sports: [],
        groupType: "AMATEUR" as GroupType,
        acceptingNewMembers: true,
        verificationStatus: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.group.update.mockResolvedValueOnce(group);

      const updatedGroup = await repository.updateGroup(groupData, groupId);

      expect(updatedGroup).toEqual({
        id: groupId,
        name: "updated Group",
        description: null,
        verificationRequest: false,
        sports: [],
        groupType: "AMATEUR" as GroupType,
        acceptingNewMembers: true,
        verificationStatus: null,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      });
      expect(prismaMock.group.update).toHaveBeenCalledWith({
        where: { id: groupId },
        data: groupData,
      });
    });
  });

  describe("deleteGroup", () => {
    it("should delete a group", async () => {
      const groupId = "1";

      prismaMock.group.delete.mockResolvedValueOnce({} as Group);

      await repository.deleteGroup(groupId);

      expect(prismaMock.group.delete).toHaveBeenCalledWith({
        where: { id: groupId },
      });
    });
  });
});
