import followRepository from "./follow.repository";
import groupRepository from "../group/group.repository";
import userFollowRepository from "../user/userFollow.repository";
import userRepository from "../user/user.repository";
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

    async followUser(followerId: string, followingId: string) {
        // Não pode seguir a si mesmo
        if (followerId === followingId) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Você não pode seguir a si mesmo");
        }

        // Verifica se o usuário a ser seguido existe
        const userToFollow = await userRepository.findById(followingId);
        if (!userToFollow) {
            throw new ApiError(httpStatus.NOT_FOUND, "Usuário não encontrado");
        }

        // Verifica se já está seguindo
        const existingFollow = await userFollowRepository.findFollow(followerId, followingId);
        if (existingFollow) {
            throw new ApiError(httpStatus.CONFLICT, "Você já está seguindo este usuário");
        }

        await userFollowRepository.createFollow(followerId, followingId);
    }

    async unfollowUser(followerId: string, followingId: string) {
        const existingFollow = await userFollowRepository.findFollow(followerId, followingId);
        if (!existingFollow) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Você não está seguindo este usuário");
        }

        await userFollowRepository.deleteFollow(followerId, followingId);
    }
}

export default new FollowService();