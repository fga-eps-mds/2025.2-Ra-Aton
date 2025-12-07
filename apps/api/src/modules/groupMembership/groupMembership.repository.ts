import { prisma } from "../../database/prisma.client";
import { Prisma, GroupMembership, GroupRole } from "@prisma/client";

class GroupMembershipRepository {
  async findAllMembers(): Promise<GroupMembership[]> {
    return prisma.groupMembership.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, userName: true, email: true },
        },
        group: true,
      },
    });
  }

  async findMemberById(id: string): Promise<GroupMembership | null> {
    return prisma.groupMembership.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, userName: true, email: true },
        },
        group: true,
      },
    });
  }

  async findMemberByUserId(userId: string): Promise<GroupMembership[]> {
    return prisma.groupMembership.findMany({
      where: { userId },
      include: {
        user: {
          select: { id: true, userName: true, email: true },
        },
        group: {
          select: { id: true, name: true, groupType: true },
        },
      },
    });
  }

  async findAdminMemberByUserId(userId: string): Promise<GroupMembership[]> {
    return prisma.groupMembership.findMany({
      where: {
        userId,
        role: GroupRole.ADMIN,
      },
      include: {
        user: {
          select: { id: true, userName: true, email: true },
        },
        group: {
          select: { id: true, name: true, groupType: true },
        },
      },
    })
  }

  async findMemberByGroupId(groupId: string): Promise<GroupMembership[]> {
    return prisma.groupMembership.findMany({
      where: { groupId },
      include: {
        user: {
          select: { id: true, userName: true, email: true },
        },
        group: true,
      },
    });
  }

  async findMemberByUserIdAndGroupId(
    userId: string,
    groupId: string,
  ): Promise<GroupMembership | null> {
    return prisma.groupMembership.findUnique({
      where: { userId_groupId: { userId, groupId } },
      include: {
        user: {
          select: { id: true, userName: true, email: true },
        },
        group: true,
      },
    });
  }

  async findAdminsByGroupId(groupId: string): Promise<GroupMembership[]> {
    return prisma.groupMembership.findMany({
      where: {
        groupId: groupId,
        role: 'ADMIN',
      },
      include: {
        user: {
          select: { id: true, userName: true, email: true},
        },
      },
    });
  }

  async createMembership(
    data: Prisma.GroupMembershipCreateInput,
    userId: string,
    groupId: string,
  ): Promise<GroupMembership> {
    return prisma.groupMembership.create({
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

  async updateMember(
    data: Prisma.GroupMembershipUpdateInput,
    id: string,
  ): Promise<GroupMembership> {
    return prisma.groupMembership.update({ where: { id }, data });
  }

  async deleteMember(id: string): Promise<void> {
    await prisma.groupMembership.delete({ where: { id } });
  }
}

export default new GroupMembershipRepository();
