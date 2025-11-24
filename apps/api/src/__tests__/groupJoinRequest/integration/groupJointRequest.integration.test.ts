import request from "supertest";
import app from "../../../app";
import httpStatus from "http-status";

// Mock REAL de classe
jest.mock("../../../modules/groupMembership/groupMembership.repository", () => ({
  __esModule: true,
  default: {
    findAllMembers: jest.fn(),
    findMemberById: jest.fn(),
    findMemberByUserId: jest.fn(),
    findMemberByGroupId: jest.fn(),
    findMemberByUserIdAndGroupId: jest.fn(),
    createMembership: jest.fn(),
    updateMember: jest.fn(),
    deleteMember: jest.fn(),
  },
}));

jest.mock("../../../modules/groupJoinRequest/groupJoinRequest.repository", () => ({
  __esModule: true,
  default: {
    findInviteByUserAndGroupId: jest.fn(),
    deleteInvite: jest.fn(),
  },
}));

import GroupMembershipRepository from "../../../modules/groupMembership/groupMembership.repository";
import groupJoinRequestRepository from "../../../modules/groupJoinRequest/groupJoinRequest.repository";

const VALID_MEMBER_ID = "11111111-1111-4111-8111-111111111111";
const VALID_USER_ID   = "22222222-2222-4222-8222-222222222222";
const VALID_GROUP_ID  = "33333333-3333-4333-8333-333333333333";
const NEW_MEMBER_ID   = "44444444-4444-4444-4444-444444444444";

describe("Integração - Módulo de GroupMembership", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    GroupMembershipRepository.findAllMembers.mockResolvedValue([]);
    GroupMembershipRepository.findMemberById.mockResolvedValue(null);
    GroupMembershipRepository.findMemberByUserId.mockResolvedValue([]);
    GroupMembershipRepository.findMemberByGroupId.mockResolvedValue([]);
    GroupMembershipRepository.findMemberByUserIdAndGroupId.mockResolvedValue(null);
    GroupMembershipRepository.createMembership.mockResolvedValue(null);
    GroupMembershipRepository.updateMember.mockResolvedValue(null);
    GroupMembershipRepository.deleteMember.mockResolvedValue(null);

    groupJoinRequestRepository.findInviteByUserAndGroupId.mockResolvedValue(null);
    groupJoinRequestRepository.deleteInvite.mockResolvedValue(null);
  });

  // LISTAR TODOS
  it("deve listar todos os membros", async () => {
    GroupMembershipRepository.findAllMembers.mockResolvedValue([
      {
        id: VALID_MEMBER_ID,
        userId: VALID_USER_ID,
        groupId: VALID_GROUP_ID,
        role: "MEMBER",
      },
    ]);

    const res = await request(app).get("/member").expect(200);

    expect(res.body.length).toBe(1);
  });

  // FIND BY ID — NOT FOUND
  it("deve retornar 404 ao buscar membro inexistente", async () => {
    GroupMembershipRepository.findMemberById.mockResolvedValue(null);

    const res = await request(app)
      .get(`/member/${VALID_MEMBER_ID}`)
      .expect(httpStatus.NOT_FOUND);

    // handler retorna { error: "..." }
    expect(res.body.error || res.body.message).toBe("Membro não encotrado");
  });

  // FIND BY ID — OK
  it("deve retornar um membro pelo ID", async () => {
    GroupMembershipRepository.findMemberById.mockResolvedValue({
      id: VALID_MEMBER_ID,
      userId: VALID_USER_ID,
      groupId: VALID_GROUP_ID,
      role: "MEMBER",
    });

    const res = await request(app)
      .get(`/member/${VALID_MEMBER_ID}`)
      .expect(200);

    expect(res.body.id).toBe(VALID_MEMBER_ID);
  });

  // FIND BY GROUP
  it("deve listar membros por ID do grupo", async () => {
    GroupMembershipRepository.findMemberByGroupId.mockResolvedValue([
      {
        id: VALID_MEMBER_ID,
        userId: VALID_USER_ID,
        groupId: VALID_GROUP_ID,
        role: "MEMBER",
      },
    ]);

    const res = await request(app)
      .get(`/member/group/${VALID_GROUP_ID}`)
      .expect(200);

    expect(res.body.length).toBe(1);
  });

  // ALREADY MEMBER
it("deve retornar 409 se usuário já for membro do grupo", async () => {
  GroupMembershipRepository.findMemberByUserIdAndGroupId.mockResolvedValue({
    id: VALID_MEMBER_ID,
    userId: VALID_USER_ID,
    groupId: VALID_GROUP_ID,
    role: "MEMBER",
  });

  const res = await request(app)
    .post("/member")
    .send({
      userId: VALID_USER_ID,
      groupId: VALID_GROUP_ID,
    })
    .expect(httpStatus.CONFLICT);

  // handler retorna { error: "..." }
  expect(res.body.error || res.body.message).toBe("Usuário já é membro do grupo");
});

});
