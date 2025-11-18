import { GroupMembership } from "@prisma/client";
import GroupMembershipRepository from "./groupMembership.repository";
import groupJoinRequestRepository from "../groupJoinRequest/groupJoinRequest.repository";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

class GroupMembershipService {
  findAllMembers = async (): Promise<GroupMembership[]> => {
    const members = await GroupMembershipRepository.findAllMembers();
    return members.map((member) => {
      return member;
    });
  };

  findMemberById = async (id: string): Promise<GroupMembership> => {
    const memberFound = await GroupMembershipRepository.findMemberById(id);
    if (!memberFound) {
      throw new ApiError(httpStatus.NOT_FOUND, "Membro não encotrado");
    }
    return memberFound;
  };

  findMemberByUserId = async (userId: string): Promise<GroupMembership[]> => {
    const members = await GroupMembershipRepository.findMemberByUserId(userId);
    return members.map((member) => {
      return member;
    });
  };

  findMemberByGroupId = async (userId: string): Promise<GroupMembership[]> => {
    const members = await GroupMembershipRepository.findMemberByGroupId(userId);
    return members.map((member) => {
      return member;
    });
  };

  findMemberByUserIdAndGroupId = async (
    userId: string,
    groupId: string,
  ): Promise<GroupMembership> => {
    const memberFound =
      await GroupMembershipRepository.findMemberByUserIdAndGroupId(
        userId,
        groupId,
      );
    if (!memberFound) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Usuario não faz parte do grupo",
      );
    }
    return memberFound;
  };

  createMembership = async (data: any): Promise<GroupMembership> => {
    const alreadyMember =
      await GroupMembershipRepository.findMemberByUserIdAndGroupId(
        data.userId,
        data.groupId,
      );
    if (alreadyMember) {
      throw new ApiError(httpStatus.CONFLICT, "Usuário já é membro do grupo");
    }

    const { userId, groupId, ...correctData } = data;
    const newMember = await GroupMembershipRepository.createMembership(
      correctData,
      userId,
      groupId,
    );
    return newMember;
  };

  updateMembership = async (
    data: any,
    id: string,
  ): Promise<GroupMembership> => {
    const updatedMember = await GroupMembershipRepository.updateMember(
      data,
      id,
    );
    return updatedMember;
  };

  deleteMembership = async (id: string): Promise<void> => {
    const memberFound = await GroupMembershipRepository.findMemberById(id);
    if (!memberFound) {
      throw new ApiError(httpStatus.NOT_FOUND, "Membro não encontrado");
    }

    const invite = await groupJoinRequestRepository.findInviteByUserAndGroupId(
      memberFound.userId,
      memberFound.groupId,
    );
    if (invite) {
      groupJoinRequestRepository.deleteInvite(invite.id);
    }

    await GroupMembershipRepository.deleteMember(id);
  };
}

export default new GroupMembershipService();
