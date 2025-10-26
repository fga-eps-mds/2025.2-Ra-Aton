import request from "supertest";
import { prisma } from "../../prisma";
import app from "../../app";

jest.setTimeout(20000);

describe("User Controller - listUsers", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("deve retornar uma lista de usuários existentes", async () => {
    // Arrange: cria dois usuários
    const user1 = {
      name: "João Lista",
      userName: "joao.lista",
      email: "joao.lista@example.com",
      password: "123456",
    };
    const user2 = {
      name: "Ana Lista",
      userName: "ana.lista",
      email: "ana.lista@example.com",
      password: "abcdef",
    };

    await request(app).post("/users").send(user1);
    await request(app).post("/users").send(user2);

    // Act: chama GET /users
    const res = await request(app).get("/users");

    // Assert
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // Deve conter pelo menos os dois usuários criados
    const emails = res.body.map((u: { email: string }) => u.email);
    expect(emails).toEqual(expect.arrayContaining([user1.email, user2.email]));
    // Nenhum usuário deve expor senha
    res.body.forEach((u: { password?: string }) => {
      expect(u).not.toHaveProperty("password");
    });
  });
});
