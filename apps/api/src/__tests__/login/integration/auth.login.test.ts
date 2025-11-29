import request from "supertest";
// Importamos o 'app' real, que usará o 'prisma' mockado
import app from "../../../app";

import { prismaMock } from "../../prisma-mock";
import HttpStatus from "http-status";
import bcrypt from "bcrypt";
import { User } from "@prisma/client";

describe("API Testes", () => {
  // Limpa o estado dos mocks antes de cada teste
  // Isso garante que um teste não interfira no outro

  beforeEach(async () => {
    jest.clearAllMocks();
    await prismaMock.user.deleteMany({});
  });

  it("teste de API funcionando", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body).toEqual({ status: "ok", service: "api" });
  });

  // --- Testes de Login /login (com DB Mockado) ---
  describe("Teste de Login /login", () => {
    it("Deve fazer login com sucesso e retornar um token", async () => {
      const registeredUser: User = {
        id: "uuid-login-123",
        email: "H1sZy@example.com",
        userName: "H1sZy",
        name: "H1sZy User",
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: await bcrypt.hash("senha123", 10),
        profileType: "JOGADOR",
      };
      prismaMock.user.findUnique.mockResolvedValue(registeredUser);

      const res = await request(app)
        .post("/login")
        .send({ email: "H1sZy@example.com", password: "senha123" });

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toHaveProperty("token");
    });

    it("Deve falhar o login com senha incorreta", async () => {
      const registeredUser: User = {
        id: "uuid-login-456",
        email: "H1sZy@example.com",
        userName: "H1sZy",
        name: "H1sZy User",
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: await bcrypt.hash("senha123", 10),
        profileType: "JOGADOR",
      };
      prismaMock.user.findUnique.mockResolvedValue(registeredUser);

      const res = await request(app)
        .post("/login")
        .send({ email: "H1sZy@example.com", password: "senhaErrada" });
      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("E-mail ou senha incorretos.");
    });

    it("Deve falhar o login com usuário não registrado", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const res = await request(app)
        .post("/login")
        .send({ email: "H1sZy@example.com", password: "senha123" });
      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toBe("E-mail não encontrado.");
    });
  });
});
