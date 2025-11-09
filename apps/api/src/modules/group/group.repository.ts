import { prisma } from "../../database/prisma.client";
import { Prisma, Group, User } from "@prisma/client";

class GroupRepository {
  async findAll(): Promise<Group[]> {
    return prisma.group.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findGroupById(id: string): Promise<Group | null> {
    return prisma.group.findUnique({ where: { id } });
  }

  async findGroupByName(name: string): Promise<Group | null> {
    return prisma.group.findUnique({ where: { name } });
  }

  async createGroup(
    data: Prisma.GroupCreateInput,
    author: User,
  ): Promise<Group> {
    return prisma.$transaction(async (tx) => {
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
    return prisma.group.update({
      where: { id },
      data,
    });
  }

  async deleteGroup(id: string): Promise<void> {
    await prisma.group.delete({ where: { id }})
  }
}

export default new GroupRepository();
