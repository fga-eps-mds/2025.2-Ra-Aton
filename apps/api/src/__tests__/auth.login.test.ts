import request from "supertest";
// Importamos o 'app' real, que usará o 'prisma' mockado
import app from "../app";
// Importamos o 'prisma' para ter uma referência ao mock e controlar seu comportamento
import { prisma } from "../prisma";

import bcrypt from "bcrypt";

import { verify } from "jsonwebtoken";

jest.mock("../prisma", () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    // Mockamos $connect e $disconnect para não fazerem nada
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

const prismaMock = prisma as jest.Mocked<typeof prisma>;

describe("API Testes", () => {
  // Limpa o estado dos mocks antes de cada teste
  // Isso garante que um teste não interfira no outro
  beforeEach(() => jest.clearAllMocks());

  it("teste de API funcionando", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", service: "api" });
  });

  // --- Testes de Login /auth/login (com DB Mockado) ---
  describe("Teste de Login /auth/login", () => {
    it("Deve fazer login com sucesso e retornar um token", async () => {
      const passwordPlain = "senha123";
      const passwordHash = bcrypt.hashSync(passwordPlain, 10);

      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        email: "user@example.com",
        name: "Teste",
        passwordHash, // campo esperado pelo endpoint
        profileType: "jogador",
      } as any);

      const res = await request(app)
        .post("/auth/login")
        .send({ email: "user@example.com", password: passwordPlain });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      // opcional: validar token decodificado
      const token = res.body.token as string;
      const payload: any = verify(token, process.env.JWT_SECRET as string);
      expect(payload).toHaveProperty("id", 1);
    });

    it("Deve falhar o login com senha incorreta", async () => {
      const passwordHash = bcrypt.hashSync("senha123", 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        email: "H1sZy@example.com",
        passwordHash,
        profileType: "jogador",
      } as any);

      const res = await request(app)
        .post("/auth/login")
        .send({ email: "H1sZy@example.com", password: "senhaIncorreta" });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "E-mail ou senha incorretos.");
    });
    it("Deve falhar o login com email não encontrado", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/auth/login")
        .send({ email: "H1sZy@example.com", password: "senha123" });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Usuário não encontrado.");
    });
  });
});
