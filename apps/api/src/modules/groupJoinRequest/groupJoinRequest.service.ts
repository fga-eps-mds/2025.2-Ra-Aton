import { GroupJoinRequest, MadeBy, NotificationType } from "@prisma/client";
import GroupJoinRequestRepository from "./groupJoinRequest.repository";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import GroupMembershipRepository from "../groupMembership/groupMembership.repository";
import GroupRepository from "../group/group.repository";
import notificationService from "../notification/notification.service";
import { userService } from "../user/user.service";

export function parseMadeBy(value?: string): MadeBy | undefined {
  if (Object.values(MadeBy).includes(value as MadeBy)) {
    return value as MadeBy;
  }

  return undefined;
}

class GroupJoinRequestService {
  findAllInvites = async (): Promise<GroupJoinRequest[]> => {
    const invites = await GroupJoinRequestRepository.findAll();
    return invites.map((invite) => {
      return invite;
    });
  };

  findInviteById = async (id: string): Promise<GroupJoinRequest> => {
    const inviteFound = await GroupJoinRequestRepository.findInviteById(id);
    if (!inviteFound) {
      throw new ApiError(httpStatus.NOT_FOUND, "Convite não encontrado");
    }
    return inviteFound;
  };

  findInviteByUserId = async (
    userId: string,
    sender?: string,
  ): Promise<GroupJoinRequest[]> => {
    const madeBy = parseMadeBy(sender);
    const invites = await GroupJoinRequestRepository.findInviteByUserId(
      userId,
      madeBy,
    );
    return invites.map((invite) => {
      return invite;
    });
  };

  findInviteByGroupId = async (
    GroupId: string,
    sender?: string,
  ): Promise<GroupJoinRequest[]> => {
    const madeBy = parseMadeBy(sender);
    const invites = await GroupJoinRequestRepository.findInviteByGroupId(
      GroupId,
      madeBy,
    );
    return invites.map((invite) => {
      return invite;
    });
  };

  createInvite = async (data: any): Promise<GroupJoinRequest> => {
    const alreadyMember =
      await GroupMembershipRepository.findMemberByUserIdAndGroupId(
        data.userId,
        data.groupId,
      );
    if (alreadyMember) {
      throw new ApiError(httpStatus.CONFLICT, "Usuário já é membro do grupo");
    }

    const existingInvite =
      await GroupJoinRequestRepository.findInviteByUserAndGroupId(
        data.userId,
        data.groupId,
      );
    if (existingInvite) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "Usuário já foi convidado para equipe recentemente",
      );
    }

    const { userId, groupId, ...correctData } = data;
    const newInvite = await GroupJoinRequestRepository.createInvite(
      correctData,
      userId,
      groupId,
    );

    if (newInvite.madeBy === MadeBy.USER) {
      const group = await GroupRepository.findGroupById(groupId);
      const user = await userService.getUserById(userId);
      const admins = await GroupMembershipRepository.findAdminsByGroupId(groupId);

      for (const admin of admins) {
        await notificationService.send(
          admin.userId,
          NotificationType.GROUP_JOIN_REQUEST,
          "Solicitação de Entrada",
          `${user.userName} solicitou para entrar no grupo ${group?.name}.`,
          groupId,
          "GROUP",
          newInvite.id,
        );
      }
    }
    return newInvite;
  };

  updateInvite = async (data: any, id: string): Promise<GroupJoinRequest> => {
    const updatedInvite = await GroupJoinRequestRepository.updateInvite(
      data,
      id,
    );

    const group = await GroupRepository.findGroupById(updatedInvite.groupId);
    const groupName = group?.name || "grupo";

    if (data.status == "APPROVED") {
      await GroupMembershipRepository.createMembership(
        {
          user: {
            connect: {
              id: updatedInvite.userId,
            },
          },
          group: {
            connect: {
              id: updatedInvite.groupId,
            },
          },
        },
        updatedInvite.userId,
        updatedInvite.groupId,
      );

      await notificationService.send(
        updatedInvite.userId,
        NotificationType.GROUP_JOIN_APPROVED,
        "Entrada Aprovada!",
        `Sua solicitação para entrar no grupo ${groupName} foi aprovada.`,
        updatedInvite.groupId,
        "GROUP",
        updatedInvite.id,
      );
    }


    if (data.status == "REJECTED") {
      await notificationService.send(
        updatedInvite.userId,
        NotificationType.GROUP_JOIN_REJECTED,
        "Entrada Rejeitada",
        `Sua solicitação para entrar no grupo ${groupName} foi rejeitada.`,
        updatedInvite.groupId,
        "GROUP",
        updatedInvite.id,
      );
    }
    return updatedInvite;
  };

  deleteInvite = async (id: string): Promise<void> => {
    await GroupJoinRequestRepository.deleteInvite(id);
  };
}

export default new GroupJoinRequestService();
