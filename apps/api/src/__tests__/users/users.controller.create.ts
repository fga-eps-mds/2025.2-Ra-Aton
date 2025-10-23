import request from "supertest";
import { prisma } from "../../prisma";
import app from "../../app"; // caminho do app Express principal

describe("User Controller", () => {
  let createdUser: any;

  beforeAll(async () => {
    // limpa o banco
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // CA1-Simples - Teste de criação bem-sucedida
  it("deve criar um novo usuário e retornar status 201 (Teste Simples)", async () => {
    const newUser = {
      name: "Carlos Teste",
      userName: "carlos.teste",
      email: "carlos.teste.simples@example.com",
      password: "pass",
    };

    // 1. Act: Fazer a chamada POST
    const res = await request(app).post("/users").send(newUser);

    // 2. Assert: Verificar o status e a estrutura básica da resposta
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe(newUser.email);
    expect(res.body.name).toBe(newUser.name);
    // Confirma que a senha não foi enviada na resposta
    expect(res.body).not.toHaveProperty("password");
  });
});
