// TODO: resolver testes com mocks do jeito certo
import request from "supertest";
// Importamos o 'app' real, que usará o 'prisma' mockado
import app from "../../../app";
// Importamos o 'prisma' para ter uma referência ao mock e controlar seu comportamento
import { prisma } from "../../../database/prisma.client";
import bcrypt from "bcrypt";
import HttpStatus from "http-status";
import { ApiError } from "../../../utils/ApiError";

jest.mock("../../database/prisma.client", () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    // Mockamos $connect e $disconnect para não fazerem nada
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

const prismaMock = prisma as jest.Mocked<typeof prisma>;

describe("API Testes", () => {
  // --- Testes de Login /login (com DB Mockado) ---
  describe("Teste de UPDATE /users/:userName", () => {
    beforeEach(async () => {
      jest.clearAllMocks();
      await prisma.user.deleteMany({});
    });

    it("Deve atualizar um usuário com sucesso", async () => {
      const updatedUser = {
        name: "Maria Teste",
        userName: "maria.teste",
        email: "maria.teste@example.com",
        password: "123456",
      };

      prismaMock.user.findUnique.mockResolvedValue({
        id: "açlfjasf901-fsklfjh91",
        email: "teste@teste.com",
        userName: "testeuser",
        name: "Usuário Teste",
        passwordHash: bcrypt.hashSync("senha123456", 10),
      });

      prismaMock.user.update.mockResolvedValue({
        id: "açlfjasf901-fsklfjh91",
        email: "teste@teste.com",
        userName: "testeuser",
        name: "Usuário Teste",
        passwordHash: bcrypt.hashSync("senha123456", 10),
        password: "senha123456",
      });

      const authResponse = await request(app)
        .post("/login")
        .send({ email: "teste@teste.com", password: "senha123456" });

      const res = await request(app)
        .patch(`/users/testeuser`)
        .set("Authorization", `Bearer ${authResponse.body.token}`)
        .send(updatedUser);

      expect(res.status).toBe(HttpStatus.OK);
      console.log(res.body);
      expect(res.body).toEqual({
        id: "açlfjasf901-fsklfjh91",
        email: "teste@teste.com",
        userName: "testeuser",
        name: "Usuário Teste",
        password: "senha123456",
      });
    });
  });
});
