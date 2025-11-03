import request from "supertest";
// Importamos o 'app' real, que usará o 'prisma' mockado
import app from "../../../app";

import { prismaMock } from "../../prisma-mock";
import { ProfileType } from "@prisma/client";
import HttpStatus from "http-status";
import bcrypt from "bcrypt";

describe("User Integration Tests", () => {
  // Limpa o estado dos mocks antes de cada teste
  // Isso garante que um teste não interfira no outro
  beforeEach(async () => {
    jest.clearAllMocks();
    await prismaMock.user.deleteMany({});
  });

  it("should create a new user via API", async () => {
    const newUser = {
      userName: "integrationUser",
      email: "integration@example.com",
      name: "Integration User",
      profileType: ProfileType.JOGADOR,
      password: "integrationPassword",
    };
    prismaMock.user.create.mockResolvedValue({
      id: "2",
      ...newUser,
      passwordHash: "hashedIntegrationPassword",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app)
      .post("/users")
      .send(newUser)
      .expect(HttpStatus.CREATED);

    expect(res.body).toMatchObject({
      id: "2",
      userName: newUser.userName,
      email: newUser.email,
      name: newUser.name,
      profileType: newUser.profileType,
    });
  });

  it("should retrieve a user by userName via API", async () => {
    const existingUser = {
      id: "3",
      userName: "existingUser",
      email: "existing@example.com",
      name: "Existing User",
      profileType: ProfileType.ATLETICA,
      passwordHash: await bcrypt.hash("existingPassword", 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.user.findUnique.mockResolvedValue(existingUser);

    const res = await request(app)
      .get(`/users/${existingUser.userName}`)
      .expect(HttpStatus.OK);

    expect(res.body).toMatchObject({
      id: existingUser.id,
      userName: existingUser.userName,
      email: existingUser.email,
      name: existingUser.name,
      profileType: existingUser.profileType,
    });
  });

  it("should return 404 when user not found via API", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await request(app)
      .get("/users/nonExistentUser")
      .expect(HttpStatus.NOT_FOUND);
  });

  it("should retrieve all users via API", async () => {
    const users = [
      {
        id: "4",
        userName: "userOne",
        email: "userOne@example.com",
        name: "User One",
        profileType: ProfileType.JOGADOR,
        passwordHash: await bcrypt.hash("userOnePassword", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "5",
        userName: "userTwo",
        email: "userTwo@example.com",
        name: "User Two",
        profileType: ProfileType.ATLETICA,
        passwordHash: await bcrypt.hash("userTwoPassword", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    prismaMock.user.findMany.mockResolvedValue(users);

    const res = await request(app).get("/users").expect(HttpStatus.OK);

    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({
      id: users[0]!.id,
      userName: users[0]!.userName,
      email: users[0]!.email,
      name: users[0]!.name,
      profileType: users[0]!.profileType,
    });
    expect(res.body[1]).toMatchObject({
      id: users[1]!.id,
      userName: users[1]!.userName,
      email: users[1]!.email,
      name: users[1]!.name,
      profileType: users[1]!.profileType,
    });
  });

  it("should receive 401 when trying to update a user without authorization", async () => {
    const existingUser = {
      id: "6",
      userName: "updatableUser",
      email: "updatable@example.com",
      name: "Updatable User",
      profileType: ProfileType.JOGADOR,
      passwordHash: await bcrypt.hash("updatablePassword", 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedData = {
      name: "Updated User Name",
      email: "updated@example",
    };

    prismaMock.user.findUnique.mockResolvedValue(existingUser);
    prismaMock.user.update.mockResolvedValue({
      ...existingUser,
      ...updatedData,
      updatedAt: new Date(),
    });

    const res = await request(app)
      .patch(`/users/${existingUser.userName}`)
      .set("Authorization", `Bearer validAuthTokenForUserId${existingUser.id}`)
      .send(updatedData)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it("should make login and update a user via API when authorized", async () => {
    const existingUser = {
      id: "7",
      userName: "authUpdatableUser",
      email: "authUpdatable@example.com",
      name: "Auth Updatable User",
      profileType: ProfileType.JOGADOR,
      passwordHash: await bcrypt.hash("authUpdatablePassword", 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedData = {
      name: "Auth Updated User Name",
      email: "authUpdated@example.com",
    };

    prismaMock.user.findUnique.mockResolvedValue(existingUser);
    prismaMock.user.update.mockResolvedValue({
      ...existingUser,
      ...updatedData,
      updatedAt: new Date(),
    });

    const loginRes = await request(app)
      .post("/login")
      .send({
        email: existingUser.email,
        password: "authUpdatablePassword",
      })
      .expect(HttpStatus.OK);

    const token = loginRes.body.token;

    const res = await request(app)
      .patch(`/users/${existingUser.userName}`)
      .set("authorization", `Bearer ${token}`)
      .send(updatedData)
      .expect(HttpStatus.OK);
    expect(res.body).toMatchObject({
      id: existingUser.id,
      userName: existingUser.userName,
      email: updatedData.email,
      name: updatedData.name,
      profileType: existingUser.profileType,
    });
  });
});
