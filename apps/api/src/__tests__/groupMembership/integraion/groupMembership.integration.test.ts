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

  it("deve retornar 404 ao buscar membro inexistente", async () => {
    groupMembershipService.findMemberById.mockImplementation(() => {
        throw new ApiError(httpStatus.NOT_FOUND, "Membro não encotrado");
    });

    const res = await request(app)
        .get(`/member/${VALID_MEMBER_ID}`)
        .expect(httpStatus.NOT_FOUND);

    // O backend não retorna mensagem — só o status, então:
    expect(res.body).toEqual({ error: "Membro não encotrado" });
  });

  it("deve retornar um membro pelo ID", async () => {
    groupMembershipService.findMemberById.mockResolvedValue({
      id: VALID_MEMBER_ID,
      userId: VALID_USER_ID,
      groupId: VALID_GROUP_ID,
      role: "MEMBER",
    });

    const res = await request(app)
      .get(`/member/${VALID_MEMBER_ID}`)
      .expect(httpStatus.OK);

    expect(res.body.id).toBe(VALID_MEMBER_ID);
  });

    it("deve retornar 409 se usuário já for membro do grupo", async () => {
        groupMembershipService.createMembership.mockImplementation(() => {
            throw new ApiError(httpStatus.CONFLICT, "Usuário já é membro do grupo");
        });

        await request(app)
            .post("/member")
            .send({ userId: VALID_USER_ID, groupId: VALID_GROUP_ID })
            .expect(httpStatus.CONFLICT);
    });

    it("deve criar um novo membro", async () => {
        const VALID_GROUP_UUID = "55555555-5555-4555-8d55-555555555555"; // UUID V4 VÁLIDO

        groupMembershipService.findMemberByUserIdAndGroupId.mockResolvedValue(null);

        groupMembershipService.createMembership.mockResolvedValue({
            id: NEW_MEMBER_ID,
            userId: VALID_USER_ID,
            groupId: VALID_GROUP_UUID,
            role: "MEMBER",
        });

        const res = await request(app)
            .post("/member")
            .send({
            userId: VALID_USER_ID,
            groupId: VALID_GROUP_UUID,
            })
            .expect(httpStatus.CREATED);

        expect(res.body.id).toBe(NEW_MEMBER_ID);
    });

  it("deve atualizar um membro", async () => {
    groupMembershipService.updateMembership.mockResolvedValue({
      id: VALID_MEMBER_ID,
      role: "ADMIN",
    });

    const res = await request(app)
      .patch(`/member/${VALID_MEMBER_ID}`)
      .send({ role: "ADMIN" })
      .expect(httpStatus.OK);

    expect(res.body.role).toBe("ADMIN");
  });

  it("deve retornar 404 ao tentar excluir membro inexistente", async () => {
    groupMembershipService.deleteMembership.mockImplementation(() => {
      throw new ApiError(httpStatus.NOT_FOUND, "Membro não encontrado");
    });

    const res = await request(app)
      .delete(`/member/${VALID_MEMBER_ID}`)
      .expect(httpStatus.NOT_FOUND);

    expect(res.body.message).toBe("Membro não encontrado");
  });

  it("deve excluir um membro existente", async () => {
    groupMembershipService.deleteMembership.mockResolvedValue(undefined);

    await request(app)
      .delete(`/member/${VALID_MEMBER_ID}`)
      .expect(httpStatus.NO_CONTENT);
  });
});
