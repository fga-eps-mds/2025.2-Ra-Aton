import request from "supertest";
import app from "../../../app";
import { prismaMock } from "../../prisma-mock";
import HttpStatus from "http-status";
import jwt from "jsonwebtoken";
import { config } from "../../../config/env";

const AUTH_USER_ID = "550e8400-e29b-41d4-a716-446655440000";
const OTHER_USER_ID = "550e8400-e29b-41d4-a716-446655440111";
const GROUP_ID = "550e8400-e29b-41d4-a716-446655440999";

const validUUID = AUTH_USER_ID;

const generateToken = (userId: string) =>
  jwt.sign({ id: userId }, config.JWT_SECRET || "secret", {
    expiresIn: "1h",
  });

describe("Testes de Integração Post (com prismaMock))", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =======================================================================
  // POST /posts
  // =======================================================================

  it("deve criar um post GENERAL com sucesso", async () => {
    const token = generateToken(AUTH_USER_ID);

    const newPostBody = {
      title: "Test Post",
      type: "GENERAL",
      content: "This is a test post.",
      group: { id: GROUP_ID },
      groupId: GROUP_ID,
    };

    prismaMock.user.findUnique.mockResolvedValue({
      id: AUTH_USER_ID,
      userName: "TestUser",
      email: "test@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
      name: "Test User",
      profileType: "JOGADOR",
      passwordHash: "hashedPassword",
    });

    prismaMock.post.create.mockResolvedValue({
      id: validUUID,
      title: newPostBody.title,
      content: newPostBody.content,
      type: "GENERAL",
      authorId: AUTH_USER_ID,
      groupId: GROUP_ID,
      createdAt: new Date(),
      updatedAt: new Date(),
      eventDate: null,
      eventFinishDate: null,
      location: null,
      likesCount: 0,
      commentsCount: 0,
      attendancesCount: 0,
    });

    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .send(newPostBody)
      .expect(HttpStatus.CREATED);

    expect(response.body).toMatchObject({
      id: validUUID,
      title: newPostBody.title,
      content: newPostBody.content,
      type: "GENERAL",
      groupId: GROUP_ID,
      authorId: AUTH_USER_ID,
    });
  });

  it("deve criar um post EVENT com sucesso quando todos os campos forem fornecidos", async () => {
    const token = generateToken(AUTH_USER_ID);

    const eventStart = new Date().toISOString();
    const eventEnd = new Date(Date.now() + 3600000).toISOString();

    const body = {
      title: "Event Test",
      type: "EVENT",
      content: "Event content",
      group: { id: GROUP_ID },
      groupId: GROUP_ID,
      eventDate: eventStart,
      eventFinishDate: eventEnd,
      location: "Main Hall",
    };

    prismaMock.user.findUnique.mockResolvedValue({
      id: AUTH_USER_ID,
      userName: "EventUser",
      email: "event@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
      name: "Event User",
      profileType: "JOGADOR",
      passwordHash: "hashedPassword",
    });

    prismaMock.post.create.mockResolvedValue({
      id: validUUID,
      title: body.title,
      content: body.content,
      type: "EVENT",
      authorId: AUTH_USER_ID,
      groupId: GROUP_ID,
      createdAt: new Date(),
      updatedAt: new Date(),
      eventDate: new Date(eventStart),
      eventFinishDate: new Date(eventEnd),
      location: "Main Hall",
      likesCount: 0,
      commentsCount: 0,
      attendancesCount: 0,
    });

    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .send(body)
      .expect(HttpStatus.CREATED);

    expect(response.body).toMatchObject({
      id: validUUID,
      title: "Event Test",
      type: "EVENT",
      location: "Main Hall",
    });
  });

  it("deve retornar 400 ao criar um EVENT sem os campos obrigatórios", async () => {
    const token = generateToken(AUTH_USER_ID);

    const body = {
      title: "Invalid Event",
      type: "EVENT",
      content: "Missing fields",
      group: { id: GROUP_ID },
      groupId: GROUP_ID,
    };

    prismaMock.user.findUnique.mockResolvedValue({
      id: AUTH_USER_ID,
      userName: "User",
      email: "x@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
      name: "User",
      profileType: "JOGADOR",
      passwordHash: "hashedPassword",
    });

    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .send(body)
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.error || response.body.message).toBeDefined();
  });

  it("deve retornar 404 quando o autor não for encontrado", async () => {
    const token = generateToken(AUTH_USER_ID);

    const body = {
      title: "Post",
      type: "GENERAL",
      content: "Something",
      group: { id: GROUP_ID },
      groupId: GROUP_ID,
    };

    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .send(body)
      .expect(HttpStatus.NOT_FOUND);

    const err = response.body.error || response.body.message;
    expect(err).toBe("Usuário não encontrado");
  });

  it("deve retornar 404 quando o grupo não existir", async () => {
    const token = generateToken(AUTH_USER_ID);

    const body = {
      title: "Post without group",
      type: "GENERAL",
      content: "Should fail",
      groupId: GROUP_ID,
    };

    prismaMock.user.findUnique.mockResolvedValue({
      id: AUTH_USER_ID,
      userName: "UserX",
      email: "xx@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
      name: "UserX",
      profileType: "JOGADOR",
      passwordHash: "hashedPassword",
    });

    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .send(body)
      .expect(HttpStatus.NOT_FOUND);

    const err = response.body.error || response.body.message;
    expect(err).toBe(
      "Grupo não encontrado, somente grupos podem fazer postagens",
    );
  });
});
