// TODO: resolver testes com mocks do jeito certo

import request from "supertest";
// Importamos o 'app' real, que usará o 'prisma' mockado
import app from "../../app";
// Importamos o 'prisma' para ter uma referência ao mock e controlar seu comportamento
import { prismaMock, DeepMockPrisma } from "../../__tests__/prisma-mock";

import bcrypt from "bcrypt";
import { verify } from "jsonwebtoken";
import { config } from "../../config/env";
import HttpStatus from "http-status";
import { ApiError } from "../../utils/ApiError";
import { User } from "@prisma/client";

const prisma: DeepMockPrisma = prismaMock;

describe("API Testes", () => {
  // Limpa o estado dos mocks antes de cada teste
  // Isso garante que um teste não interfira no outro

  beforeEach(async () => {
    jest.clearAllMocks();
    await prisma.user.deleteMany({});
  });

  it("teste de API funcionando", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body).toEqual({ status: "ok", service: "api" });
  });

  // --- Testes de Login /login (com DB Mockado) ---
  describe("Teste de Login /login", () => {
    it("Deve fazer login com sucesso e retornar um token", async () => {
      const passwordPlain = "senha123456";
      const passwordHash = bcrypt.hashSync(passwordPlain, 10);

      const userInput = {
        name: "Test User",
        email: "test@example.com",
        password: passwordPlain,
        profileType: null,
        userName: "testuser",
      };

      await prisma.user.create.mockResolvedValue({
        id: "1",
        name: userInput.name,
        email: userInput.email,
        userName: userInput.userName,
        profileType: userInput.profileType,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Verifica se o usuário existe antes de tentar fazer login
      const mockUserResult: User | null = await prisma.user.findUnique({
        where: { email: userInput.email },
      });

      if (!mockUserResult) {
        throw new ApiError(HttpStatus.UNAUTHORIZED, "E-mail não encontrado.");
      }

      //prisma.user.create.mockResolvedValue(mockUserResult);

      const res = await request(app).post("/login").send(mockUserResult);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toHaveProperty("token");
      // opcional: validar token decodificado
      const token = res.body.token as string;
      const payload: any = verify(token, config.JWT_SECRET as string);
      expect(payload).toHaveProperty("id", 1);
    });

    // it("Deve falhar o login com senha incorreta", async () => {
    //   const passwordHash = bcrypt.hashSync("senha123", 10);
    //   prismaMock.user.findUnique.mockResolvedValue({
    //     id: 1,
    //     email: "H1sZy@example.com",
    //     passwordHash,
    //     profileType: "jogador",
    //   } as any);

    //   const res = await request(app)
    //     .post("/login")
    //     .send({ email: "H1sZy@example.com", password: "senhaIncorreta" });

    //   const error = new ApiError(
    //     HttpStatus.UNAUTHORIZED,
    //     "E-mail ou senha incorretos.",
    //   );

    //   expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    //   expect(res.body).toHaveProperty("error", error.message);
    // });
    // it("Deve falhar o login com email não encontrado", async () => {
    //   prismaMock.user.findUnique.mockResolvedValue(null);

    //   const res = await request(app)
    //     .post("/login")
    //     .send({ email: "H1sZy@example.com", password: "senha123" });

    //   const error = new ApiError(
    //     HttpStatus.UNAUTHORIZED,
    //     "E-mail não encontrado.",
    //   );

    //   expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    //   expect(res.body).toHaveProperty("error", error.message);
    // });
  });
});
