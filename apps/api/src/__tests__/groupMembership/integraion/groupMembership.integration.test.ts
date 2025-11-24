import request from "supertest";
import app from "../../../app";
import httpStatus from "http-status";

jest.mock("../../../modules/groupMembership/groupMembership.service", () => {
  return {
    __esModule: true,
    default: {
      findAllMembers: jest.fn(),
      findMemberById: jest.fn(),
      findMemberByUserId: jest.fn(),
      findMemberByGroupId: jest.fn(),
      findMemberByUserIdAndGroupId: jest.fn(),
      createMembership: jest.fn(),
      updateMembership: jest.fn(),
      deleteMembership: jest.fn(),
    },
  };
});

jest.mock("../../../modules/groupJoinRequest/groupJoinRequest.repository", () => {
  return {
    __esModule: true,
    default: {
      findInviteByUserAndGroupId: jest.fn(),
      deleteInvite: jest.fn(),
    },
  };
});

import groupMembershipService from "../../../modules/groupMembership/groupMembership.service";
import groupJoinRequestRepository from "../../../modules/groupJoinRequest/groupJoinRequest.repository";
import { ApiError } from "../../../utils/ApiError";

const VALID_MEMBER_ID = "11111111-1111-4111-8111-111111111111";
const VALID_USER_ID   = "22222222-2222-4222-8222-222222222222";
const VALID_GROUP_ID  = "33333333-3333-4333-8333-333333333333";
const NEW_MEMBER_ID   = "44444444-4444-4444-4444-444444444444";

describe("Integração - Módulo de GroupMembership (/member)", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    groupMembershipService.findAllMembers.mockResolvedValue([]);
    groupMembershipService.findMemberById.mockResolvedValue(null);
    groupMembershipService.findMemberByUserId.mockResolvedValue([]);
    groupMembershipService.findMemberByGroupId.mockResolvedValue([]);
    groupMembershipService.findMemberByUserIdAndGroupId.mockResolvedValue(null);

    groupMembershipService.createMembership.mockResolvedValue(null);
    groupMembershipService.updateMembership.mockResolvedValue(null);
    groupMembershipService.deleteMembership.mockResolvedValue(null);

    groupJoinRequestRepository.findInviteByUserAndGroupId.mockResolvedValue(null);
    groupJoinRequestRepository.deleteInvite.mockResolvedValue(null);
  });

  it("deve listar todos os membros", async () => {
    groupMembershipService.findAllMembers.mockResolvedValue([
      {
        id: VALID_MEMBER_ID,
        userId: VALID_USER_ID,
        groupId: VALID_GROUP_ID,
        role: "MEMBER",
      },
    ]);

    const res = await request(app).get("/member").expect(httpStatus.OK);
    expect(res.body.length).toBe(1);
  });


});
