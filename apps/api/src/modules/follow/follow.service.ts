import followRepository from "./follow.repository";
import groupRepository from "../group/group.repository";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

class FollowService {
    async followGroup(userId: string, groupId: string) {
        const group = await groupRepository.findGroupById(groupId);
        if (!group) {
            throw new ApiError(httpStatus.NOT_FOUND, "Grupo não encontrado");
        }

        const existingFollow = await followRepository.findFollow(userId, groupId);
        if (existingFollow) {
            throw new ApiError(httpStatus.CONFLICT, "Você já está seguindo este grupo");
        }

        await followRepository.createFollow(userId, groupId);
    }

    async unfollowGroup(userId: string, groupId: string) {
        const existingFollow = await followRepository.findFollow(userId, groupId);
        if (!existingFollow) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Você não está seguindo este grupo");
        }

        await followRepository.deleteFollow(userId, groupId);
    }

    async getUserFollowingGroups(userId: string, limit: number, page: number) {
        const offset = (page - 1) * limit;

        const { groups, totalCount } = await followRepository.findGroupsFollowedByUser(userId, limit, offset);

        const totalPages = Math.ceil(totalCount / limit);

        return {
            data: groups,
            meta: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }
}

export default new FollowService();