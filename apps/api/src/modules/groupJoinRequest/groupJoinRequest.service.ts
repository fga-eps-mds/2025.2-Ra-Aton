import { GroupJoinRequest, MadeBy } from "@prisma/client";
import GroupJoinRequestRepository from "./groupJoinRequest.repository";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

function parseMadeBy(value?: string): MadeBy | undefined {
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
    const newInvite = await GroupJoinRequestRepository.createInvite(data);
    return newInvite;
  };

  updateInvite = async (data: any, id: string): Promise<GroupJoinRequest> => {
    const updatedInvite = await GroupJoinRequestRepository.updateInvite(
      data,
      id,
    );
    return updatedInvite;
  };

  deleteInvite = async (id: string): Promise<void> => {
    await GroupJoinRequestRepository.deleteInvite(id);
  };
}

export default new GroupJoinRequestService();
