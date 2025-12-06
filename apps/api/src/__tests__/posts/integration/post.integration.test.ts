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

    const eventStart = new Date(Date.now() + 3600000).toISOString(); // Data futura
    const eventEnd = new Date(Date.now() + 7200000).toISOString(); // Data + futura ainda

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

  // =======================================================================
  // GET /posts
  // =======================================================================

  it("deve listar posts com paginação", async () => {
    const token = generateToken(AUTH_USER_ID);

    const now = new Date();

    const posts = [
      {
        id: validUUID,
        title: "A",
        content: "B",
        type: "GENERAL",
        authorId: AUTH_USER_ID,
        groupId: GROUP_ID,
        createdAt: now,
        updatedAt: now,
      },
    ];

    prismaMock.$transaction.mockResolvedValue([posts, 1]);

    prismaMock.postLike.findMany.mockResolvedValue([]);
    prismaMock.attendance.findMany.mockResolvedValue([]);

    const response = await request(app)
      .get("/posts")
      .set("Authorization", `Bearer ${token}`)
      .query({ limit: 10, page: 1 })
      .send({ userId: AUTH_USER_ID })
      .expect(HttpStatus.OK);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta.totalCount).toBe(1);
  });

  // =======================================================================
  // GET /posts/:id
  // =======================================================================

  it("deve retornar 400 se o id for inválido", async () => {
    const token = generateToken(AUTH_USER_ID);

    await request(app)
      .get("/posts/not-a-uuid")
      .set("Authorization", `Bearer ${token}`)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it("deve retornar um post por id", async () => {
    const token = generateToken(AUTH_USER_ID);
    const now = new Date();

    prismaMock.post.findUnique.mockResolvedValue({
      id: validUUID,
      title: "Some Title",
      content: "Text",
      type: "GENERAL",
      authorId: AUTH_USER_ID,
      groupId: GROUP_ID,
      createdAt: now,
      updatedAt: now,
      likesCount: 0,
      attendancesCount: 0,
      commentsCount: 0,
      eventDate: null,
      eventFinishDate: null,
      location: null,
    });

    const response = await request(app)
      .get(`/posts/${validUUID}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty("id");
  });

  it("deve retornar 404 quando o post não existir", async () => {
    const token = generateToken(AUTH_USER_ID);

    prismaMock.post.findUnique.mockResolvedValue(null);

    await request(app)
      .get(`/posts/${validUUID}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  // =======================================================================
  // PATCH /posts/:id
  // =======================================================================

  it("deve atualizar um post quando o usuário é o autor", async () => {
    const token = generateToken(AUTH_USER_ID);

    const existing = {
      id: validUUID,
      title: "Old",
      content: "Old",
      type: "GENERAL",
      authorId: AUTH_USER_ID,
      groupId: GROUP_ID,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updated = {
      ...existing,
      title: "New Title",
      content: "New Content",
      updatedAt: new Date(),
    };

    // @ts-ignore
    prismaMock.post.findUnique.mockResolvedValue(existing);
    // @ts-ignore
    prismaMock.post.update.mockResolvedValue(updated);

    const response = await request(app)
      .patch(`/posts/${validUUID}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "New Title", content: "New Content" })
      .expect(HttpStatus.OK);

    expect(response.body.title).toBe("New Title");
  });

  it("não deve atualizar um post se o usuário não for o autor", async () => {
    const token = generateToken(OTHER_USER_ID);

    prismaMock.post.findUnique.mockResolvedValue({
      id: validUUID,
      authorId: AUTH_USER_ID,
      createdAt: new Date(),
      updatedAt: new Date(),
      title: "Old Title",
      content: "Old Content",
      type: "GENERAL",
      groupId: GROUP_ID,
      eventDate: null,
      eventFinishDate: null,
      location: null,
      likesCount: 0,
      commentsCount: 0,
      attendancesCount: 0,
    });

    const response = await request(app)
      .patch(`/posts/${validUUID}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "New Title" })
      .expect(HttpStatus.FORBIDDEN);

    const err = response.body.error || response.body.message;
    expect(err).toBe("Você não tem permissão para atualizar esta postagem");
  });

  it("deve retornar 404 ao tentar atualizar um post inexistente", async () => {
    const token = generateToken(AUTH_USER_ID);

    prismaMock.post.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .patch(`/posts/${validUUID}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Valid Title" })
      .expect(HttpStatus.NOT_FOUND);

    expect(response.body.error || response.body.message).toBeDefined();
  });

  // =======================================================================
  // DELETE /posts/:id
  // =======================================================================

  it("deve excluir um post quando o usuário é o autor", async () => {
    const token = generateToken(AUTH_USER_ID);

    // @ts-ignore
    prismaMock.post.findUnique.mockResolvedValue({
      id: validUUID,
      authorId: AUTH_USER_ID,
    });

    // @ts-ignore
    prismaMock.post.delete.mockResolvedValue({ id: validUUID });

    await request(app)
      .delete(`/posts/${validUUID}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(HttpStatus.NO_CONTENT);
  });

  it("não deve excluir um post se o usuário não for o autor", async () => {
    const token = generateToken(OTHER_USER_ID);

    // @ts-ignore
    prismaMock.post.findUnique.mockResolvedValue({
      id: validUUID,
      authorId: AUTH_USER_ID,
    });

    const response = await request(app)
      .delete(`/posts/${validUUID}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(HttpStatus.FORBIDDEN);

    const err = response.body.error || response.body.message;
    expect(err).toBe("Você não tem permissão para excluir esta postagem");
  });

  it("deve retornar 404 ao tentar excluir um post inexistente", async () => {
    const token = generateToken(AUTH_USER_ID);

    prismaMock.post.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .delete(`/posts/${validUUID}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(HttpStatus.NOT_FOUND);

    expect(response.body.error || response.body.message).toBeDefined();
  });
});
