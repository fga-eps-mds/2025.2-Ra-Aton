import { prisma } from "../../database/prisma.client";
import { Prisma, Group, User } from "@prisma/client";

export class GroupRepository {
  constructor(private prismaClient = prisma) {}

  async findAll(): Promise<Group[]> {
    return this.prismaClient.group.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findAllOpenGroups(): Promise<Group[]> {
    return this.prismaClient.group.findMany({
      orderBy: { createdAt: "desc" },
      where: { acceptingNewMembers: true },
    });
  }

  async findGroupById(id: string): Promise<Group | null> {
    return this.prismaClient.group.findUnique({
      where: { id },
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
  }

  async findGroupByName(name: string): Promise<Group | null> {
    return this.prismaClient.group.findUnique({
      where: { name },
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
  }

  async createGroup(
    data: Prisma.GroupCreateInput,
    author: User,
  ): Promise<Group> {
    return this.prismaClient.$transaction(async (tx) => {
      const newGroup = await tx.group.create({
        data,
      });
      await tx.groupMembership.create({
        data: {
          userId: author.id,
          groupId: newGroup.id,
          role: "ADMIN",
          isCreator: true,
        },
      });
      return newGroup;
    });
  }

  async updateGroup(data: Prisma.GroupUpdateInput, id: string): Promise<Group> {
    return this.prismaClient.group.update({
      where: { id },
      data,
    });
  }

  async deleteGroup(id: string): Promise<void> {
    await this.prismaClient.group.delete({ where: { id } });
  }
}
// Default export kept for backward compatibility
const defaultExport = new GroupRepository();
export default defaultExport;

