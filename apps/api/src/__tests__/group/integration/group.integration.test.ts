import request from "supertest";
import app from "../../../app";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import { config } from "../../../config/env";
import { prismaMock } from "../../prisma-mock";

// Mock do userService
jest.mock("../../../modules/user/user.service", () => ({
  userService: {
    getUserById: jest.fn(),
  },
}));

// Mock do GroupRepository
jest.mock("../../../modules/group/group.repository", () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    findAllOpenGroups: jest.fn(),
    findGroupByName: jest.fn(),
    createGroup: jest.fn(),
    updateGroup: jest.fn(),
    deleteGroup: jest.fn(),
  },
}));

// Mock do GroupMembershipRepository
jest.mock(
  "../../../modules/groupMembership/groupMembership.repository",
  () => ({
    findMemberByUserIdAndGroupId: jest.fn(),
  }),
);

import GroupRepository from "../../../modules/group/group.repository";
import GroupMembershipRepository from "../../../modules/groupMembership/groupMembership.repository";
import { userService } from "../../../modules/user/user.service";

const AUTH_USER = "00000000-0000-4000-8000-000000000001";
const OTHER_USER = "00000000-0000-4000-8000-000000000002";

const generateToken = (id: string) =>
  jwt.sign({ id }, config.JWT_SECRET || "secret", { expiresIn: "1h" });

describe("Integração - Módulo de Grupos", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock do usuário autenticado (sempre existente)
    (userService.getUserById as jest.Mock).mockResolvedValue({
      id: AUTH_USER,
      userName: "Usuario Teste",
      email: "email@teste.com",
    });

    // Mock default de membership
    (
      GroupMembershipRepository.findMemberByUserIdAndGroupId as jest.Mock
    ).mockResolvedValue(null);
  });

  // ============================================================================
  // LISTAGEM
  // ============================================================================

  it("deve listar todos os grupos", async () => {
    (GroupRepository.findAll as jest.Mock).mockResolvedValue([
      {
        id: "g1",
        name: "Basquete",
        description: "Grupo de basquete",
        acceptingNewMembers: true,
      },
    ]);

    const res = await request(app).get("/group").expect(httpStatus.OK);

    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("Basquete");
  });

  // ============================================================================
  // BUSCAR POR NOME
  // ============================================================================

  it("deve retornar 404 ao buscar grupo inexistente", async () => {
    (GroupRepository.findGroupByName as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .get("/group/Inexistente")
      .expect(httpStatus.NOT_FOUND);

    expect(res.body.error).toBe("Grupo não encontrado");
  });

  it("deve retornar grupo ao buscar por nome", async () => {
    (GroupRepository.findGroupByName as jest.Mock).mockResolvedValue({
      id: "g1",
      name: "Basquete",
      memberships: [],
      _count: { memberships: 0 },
    });

    const res = await request(app)
      .get("/group/Basquete")
      .expect(httpStatus.FOUND);

    expect(res.body.name).toBe("Basquete");
  });


  // ============================================================================
  // CRIAÇÃO
  // ============================================================================

  it("deve retornar 409 ao tentar criar grupo já existente", async () => {
    const token = generateToken(AUTH_USER);

    (GroupRepository.findGroupByName as jest.Mock).mockResolvedValue({
      id: "g1",
      name: "Basquete",
    });

    const res = await request(app)
      .post("/group")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Basquete",
        description: "desc",
        verificationRequest: false,
      })
      .expect(httpStatus.CONFLICT);

    expect(res.body.error).toBe("Nome do grupo já está em uso");
  });

  it("deve criar grupo com sucesso", async () => {
    const token = generateToken(AUTH_USER);

    (GroupRepository.findGroupByName as jest.Mock).mockResolvedValue(null);

    (GroupRepository.createGroup as jest.Mock).mockResolvedValue({
      id: "g2",
      name: "Futsal",
      description: "Grupo teste",
    });

    const res = await request(app)
      .post("/group")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Futsal",
        description: "Grupo teste",
        verificationRequest: false,
      })
      .expect(httpStatus.CREATED);

    expect(res.body.name).toBe("Futsal");
  });

    // ============================================================================
  // UPDATE
  // ============================================================================

  it("deve atualizar grupo quando usuário é ADMIN", async () => {
    const token = generateToken(AUTH_USER);

    (GroupRepository.findGroupByName as jest.Mock)
      .mockResolvedValueOnce({
        id: "g4",
        name: "Antigo",
      })
      .mockResolvedValueOnce(null); // ← garante que "Atualizado" é disponível

    (
      GroupMembershipRepository.findMemberByUserIdAndGroupId as jest.Mock
    ).mockResolvedValue({
      userId: AUTH_USER,
      role: "ADMIN",
    });

    (GroupRepository.updateGroup as jest.Mock).mockResolvedValue({
      id: "g4",
      name: "Atualizado",
    });

    const res = await request(app)
      .patch("/group/Antigo")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Atualizado" })
      .expect(httpStatus.OK);

    expect(res.body.name).toBe("Atualizado");
  });

  it("deve retornar 403 ao tentar atualizar grupo sem permissão", async () => {
    const token = generateToken(OTHER_USER);

    (userService.getUserById as jest.Mock).mockResolvedValue({
      id: OTHER_USER,
      userName: "Outro",
    });

    (GroupRepository.findGroupByName as jest.Mock).mockResolvedValue({
      id: "g4",
      name: "Antigo",
    });

    (
      GroupMembershipRepository.findMemberByUserIdAndGroupId as jest.Mock
    ).mockResolvedValue({
      userId: OTHER_USER,
      role: "MEMBER",
    });

    const res = await request(app)
      .patch("/group/Antigo")
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "Nova desc" })
      .expect(httpStatus.FORBIDDEN);

    expect(res.body.message).toBe(
      "Usuário não possui permissão para editar o grupo",
    );
  });


});
