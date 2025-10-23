// tests/user.controller.test.ts
import request from "supertest";
import { prisma } from "../../prisma";
import app from "../../app"; // seu app Express principal

jest.setTimeout(20000);

describe("User Controller - getUser", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("deve retornar um usuário existente pelo userName", async () => {
    // Arrange: cria um usuário
    const newUser = {
      name: "Maria Teste",
      userName: "maria.teste",
      email: "maria.teste@example.com",
      password: "123456",
    };

    const createRes = await request(app).post("/users").send(newUser);
    expect(createRes.status).toBe(201);

    // Act: busca o usuário pelo userName
    const res = await request(app).get(`/users/${newUser.userName}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe(newUser.name);
    expect(res.body.userName).toBe(newUser.userName);
    expect(res.body.email).toBe(newUser.email);
    expect(res.body).not.toHaveProperty("password");
  });

  it("deve retornar 404 se o usuário não existir", async () => {
    const res = await request(app).get("/users/naoexiste123");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "User not found");
  });
});
