import { prisma } from "../../database/prisma.client";
import { Prisma, Group, User } from "@prisma/client";

class GroupRepository {
  async findAll(): Promise<Group[]> {
    return prisma.group.findMany({ orderBy: { createdAt: "desc" } });
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
}

export default new GroupRepository();
