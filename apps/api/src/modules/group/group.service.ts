import { Group } from "@prisma/client";
import GroupRepository from "./group.repository";
import GroupMembershipRepository from "../groupMembership/groupMembership.repository";
import followRepository from "../follow/follow.repository";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

export type GroupWithDetails = Group & {
  isFollowing: boolean;
};

class GroupService {
  getAllGroups = async (): Promise<Group[]> => {
    const groups = await GroupRepository.findAll();
    return groups.map((group: Group) => {
      return group;
    });
  };

  getAllOpenGroups = async (): Promise<Group[]> => {
    const groups = await GroupRepository.findAllOpenGroups();
    return groups.map((group: Group) => {
      return group;
    });
  };

  getGroupByName = async (name: string, userId?: string): Promise<GroupWithDetails> => {
    const groupFound = await GroupRepository.findGroupByName(name);
    if (!groupFound) {
      throw new ApiError(httpStatus.NOT_FOUND, "Grupo não encontrado");
    }

    let isFollowing = false;
    if (userId) {
      const follow = await followRepository.findFollow(userId, groupFound.id);
      isFollowing = !!follow;
    }

    return { ...groupFound, isFollowing };
  };

  createGroup = async (data: any, author: any): Promise<Group> => {
    const existingGroup = await GroupRepository.findGroupByName(data.name);
    if (existingGroup) {
      throw new ApiError(httpStatus.CONFLICT, "Nome do grupo já está em uso");
    }

    if (data.verificationRequest) {
      data.verificationStatus = "PENDING";
    }

    const newGroup = await GroupRepository.createGroup(data, author);
    return newGroup;
  };

  updateGroup = async (
    data: any,
    userId: string,
    groupName: string,
  ): Promise<Group> => {
    const groupFound = await GroupRepository.findGroupByName(groupName);
    if (!groupFound) {
      throw new ApiError(httpStatus.NOT_FOUND, "Grupo não encontrado");
    }

    const memberFound =
      await GroupMembershipRepository.findMemberByUserIdAndGroupId(
        userId,
        groupFound.id,
      );
    if (!memberFound) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Usuário não faz parte do grupo",
      );
    }

    if (memberFound.role !== "ADMIN") {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Usuário não possui permissão para editar o grupo",
      );
    }

    if (data.name) {
      const existingGroup = await GroupRepository.findGroupByName(data.name);
      if (existingGroup) {
        throw new ApiError(httpStatus.CONFLICT, "Nome do grupo já está em uso");
      }
    }

    const updatedGroup = await GroupRepository.updateGroup(data, groupFound.id);
    return updatedGroup;
  };

  deleteGroup = async (userId: string, groupName: string): Promise<void> => {
    const groupFound = await GroupRepository.findGroupByName(groupName);
    if (!groupFound) {
      throw new ApiError(httpStatus.NOT_FOUND, "Grupo não encontrado");
    }

    const memberFound =
      await GroupMembershipRepository.findMemberByUserIdAndGroupId(
        userId,
        groupFound.id,
      );
    if (!memberFound) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Usuário não faz parte do grupo",
      );
    }

    if (memberFound.role !== "ADMIN") {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Usuário não possui permissão para editar o grupo",
      );
    }

    await GroupRepository.deleteGroup(groupFound.id);
  };
}

export default new GroupService();
