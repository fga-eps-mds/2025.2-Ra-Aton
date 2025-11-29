import { prisma } from "../../database/prisma.client";
import { Prisma, GroupJoinRequest, MadeBy } from "@prisma/client";

class GroupJoinRequestRepository {
  async findAll(): Promise<GroupJoinRequest[]> {
    return prisma.groupJoinRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, userName: true, email: true },
        },
        group: true,
      },
    });
  }

  async findInviteById(id: string): Promise<GroupJoinRequest | null> {
    return prisma.groupJoinRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, userName: true, email: true },
        },
        group: true,
      },
    });
  }

  async findInviteByUserId(
    userId: string,
    madeBy?: MadeBy,
  ): Promise<GroupJoinRequest[]> {
    return prisma.groupJoinRequest.findMany({
      where: {
        userId: userId,
        ...(madeBy && { madeBy }),
      },
      include: {
        user: {
          select: { id: true, userName: true, email: true },
        },
        group: true,
      },
    });
  }

  async findInviteByGroupId(
    groupId: string,
    madeBy?: MadeBy,
  ): Promise<GroupJoinRequest[]> {
    return prisma.groupJoinRequest.findMany({
      where: { groupId: groupId, ...(madeBy && { madeBy }) },
      include: {
        user: {
          select: { id: true, userName: true, email: true },
        },
        group: true,
      },
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
      include: {
        user: {
          select: { id: true, userName: true, email: true },
        },
        group: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async createInvite(
    data: Prisma.GroupJoinRequestCreateInput,
    userId: string,
    groupId: string,
  ): Promise<GroupJoinRequest> {
    return prisma.groupJoinRequest.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
        group: {
          connect: { id: groupId },
        },
      },
      include: {
        user: {
          select: { id: true, userName: true, email: true },
        },
        group: true,
      },
    });
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
