import { GroupMembership } from "@prisma/client";
import GroupMembershipRepository from "./groupMembership.repository";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

class GroupMembershipService {
  getGroupMember = async (
    userId: string,
    groupId: string,
  ): Promise<GroupMembership> => {
    const memberFound = await GroupMembershipRepository.findMember(userId, groupId);
    if (!memberFound) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Usuario não faz parte do grupo",
      );
    }
    return memberFound;
  };
}

export default new GroupMembershipService();