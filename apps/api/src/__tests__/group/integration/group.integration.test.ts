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
});
