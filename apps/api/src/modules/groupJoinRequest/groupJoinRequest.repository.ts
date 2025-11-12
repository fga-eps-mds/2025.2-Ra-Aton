import { prisma } from "../../database/prisma.client";
import { Prisma, GroupJoinRequest, MadeBy } from "@prisma/client";

class GroupJoinRequestRepository {
  async findAll(): Promise<GroupJoinRequest[]> {
    return prisma.groupJoinRequest.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findInviteById(id: string): Promise<GroupJoinRequest | null> {
    return prisma.groupJoinRequest.findUnique({ where: { id } });
  }

  async findInviteByUserId(
    userId: string,
    madeBy?: MadeBy,
  ): Promise<GroupJoinRequest[]> {
    return prisma.groupJoinRequest.findMany({
      where: {
        userId,
        ...(madeBy && { madeBy }),
      },
    });
  }

  async findInviteByGroupId(
    groupId: string,
    madeBy?: MadeBy,
  ): Promise<GroupJoinRequest[]> {
    return prisma.groupJoinRequest.findMany({
      where: { groupId, ...(madeBy && { madeBy }) },
    });
  }

  findInviteByUserAndGroupId(
    userId: string,
    groupId: string,
  ): Promise<GroupJoinRequest | null> {
    return prisma.groupJoinRequest.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });
  }

  async createInvite(
    data: Prisma.GroupJoinRequestCreateInput,
  ): Promise<GroupJoinRequest> {
    return prisma.groupJoinRequest.create({ data });
  }

  async updateInvite(
    data: Prisma.GroupJoinRequestUpdateInput,
    id: string,
  ): Promise<GroupJoinRequest> {
    return prisma.groupJoinRequest.update({
      where: { id },
      data,
    });
  }

  async deleteInvite(id: string): Promise<void> {
    await prisma.groupJoinRequest.delete({ where: { id } });
  }
}

export default new GroupJoinRequestRepository();
