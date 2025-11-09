import { prisma } from "../../database/prisma.client";
import { Prisma, GroupMembership } from "@prisma/client";

class GroupMembershipRepository {
  async findMember(
    userId: string,
    groupId: string,
  ): Promise<GroupMembership | null> {
    return prisma.groupMembership.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });
  }
}

export default new GroupMembershipRepository();