import { prisma } from "../../database/prisma.client";
import { GroupFollow, Group } from "@prisma/client";

export type FollowingResponse = {
    groups: Group[];
    totalCount: number;
}

class FollowRepository {
    async findFollow(userId: string, groupId: string): Promise<GroupFollow | null> {
        return await prisma.groupFollow.findUnique({
            where: {
                userId_groupId: {
                    userId,
                    groupId
                },
            },
        });
    }

    async createFollow(userId: string, groupId: string): Promise<GroupFollow> {
        return prisma.groupFollow.create({
            data: {
                userId,
                groupId,
            },
        });
    }

    async deleteFollow(userId: string, groupId: string): Promise<GroupFollow> {
        return prisma.groupFollow.delete({
            where: {
                userId_groupId: {
                    userId,
                    groupId,
                },
            },
        });
    }

    async findGroupsFollowedByUser(userId: string, limit: number, offset: number): Promise<FollowingResponse> {
        const [follows, totalCount] =  await prisma.$transaction([
            prisma.groupFollow.findMany({
                where: { userId },
                take: limit,
                skip: offset,
                orderBy: { createdAt: 'desc' },
                include: {
                    group: true,
                },
            }),
            prisma.groupFollow.count({ where: { userId } }),
        ]);

        const groups = follows.map((f) => f.group);

        return { groups, totalCount };
    }
}

export default new FollowRepository();