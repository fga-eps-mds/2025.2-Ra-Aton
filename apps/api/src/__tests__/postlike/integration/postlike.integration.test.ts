import request from "supertest";
import app from "../../../app";
import { prismaMock } from "../../prisma-mock";
import HttpStatus from "http-status";
import jwt from "jsonwebtoken";
import { config } from "../../../config/env";

const USER_ID = "550e8400-e29b-41d4-a716-446655440000";
const POST_ID = "550e8400-e29b-41d4-a716-446655440111";

// Gera token JWT válido
const generateToken = (userId: string) =>
  jwt.sign({ id: userId }, config.JWT_SECRET || "secret", { expiresIn: "1h" });

describe("POSTLIKE Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // 1) CURTIR UM POST (LIKE)
  // ===========================================================================
  it("deve curtir um post quando nenhuma curtida existente for encontrada", async () => {
    const token = generateToken(USER_ID);

    // Mock: NÃO existe curtida ainda
    prismaMock.postLike.findFirst.mockResolvedValue(null);

    // Mock: criar a curtida
    prismaMock.postLike.create.mockResolvedValue({
      id: "like-123",
      postId: POST_ID,
      userId: USER_ID,
    });

    // Mock: update contador de likes
    prismaMock.post.update.mockResolvedValue({});

    const response = await request(app)
      .post(`/posts/${POST_ID}/like`)
      .set("Authorization", `Bearer ${token}`)
      .send({ authorId: USER_ID })
      .expect(HttpStatus.CREATED);

    expect(response.body).toMatchObject({
      id: "like-123",
      postId: POST_ID,
      userId: USER_ID,
    });

    expect(prismaMock.post.update).toHaveBeenCalledWith({
      where: { id: POST_ID },
      data: { likesCount: { increment: 1 } },
    });
  });

  // ===========================================================================
  // 2) REMOVER CURTIDA (UNLIKE)
  // ===========================================================================
  it("deve remover a curtida de um post quando uma curtida existente for encontrada", async () => {
    const token = generateToken(USER_ID);

    prismaMock.postLike.findFirst.mockResolvedValue({
      id: "like-987",
      postId: POST_ID,
      userId: USER_ID,
    });

    prismaMock.postLike.delete.mockResolvedValue({
      id: "like-987",
      postId: POST_ID,
      userId: USER_ID,
    });

    prismaMock.post.update.mockResolvedValue({});

    const response = await request(app)
      .post(`/posts/${POST_ID}/like`)
      .set("Authorization", `Bearer ${token}`)
      .send({ authorId: USER_ID })
      .expect(HttpStatus.CREATED);

    expect(response.body).toMatchObject({
      id: "like-987",
      postId: POST_ID,
      userId: USER_ID,
    });

    expect(prismaMock.post.update).toHaveBeenCalledWith({
      where: { id: POST_ID },
      data: { likesCount: { increment: -1 } },
    });
  });

  // ===========================================================================
  // 3) ERRO — FALTA DE authorId NO BODY
  // ===========================================================================
  it("deve retornar 400 quando authorId estiver ausente no corpo da requisição", async () => {
    const token = generateToken(USER_ID);

    const response = await request(app)
      .post(`/posts/${POST_ID}/like`)
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.status).toBe(400);
    expect(response.body).toBeDefined();
    expect(response.body.errors || response.body.error).toBeDefined();
    expect(response.body.errors || response.body.error).toBe("Erro de validação");
  });

  // ===========================================================================
  // 4) ERRO — postId inválido (UUID inválido)
  // ===========================================================================
  it("deve retornar 400 quando o postId for inválido", async () => {
    const token = generateToken(USER_ID);

    await request(app)
      .post("/posts/not-a-uuid/like")
      .set("Authorization", `Bearer ${token}`)
      .send({ authorId: USER_ID })
      .expect(HttpStatus.BAD_REQUEST);
  });

  // ===========================================================================
  // 5) ERRO — EXCEÇÃO INTERNA DO SERVICE / PRISMA
  // ===========================================================================
  it("deve retornar 500 quando o Prisma lançar uma exceção interna", async () => {
    const token = generateToken(USER_ID);

    prismaMock.postLike.findFirst.mockRejectedValue(
      new Error("Database exploded"),
    );

    const response = await request(app)
      .post(`/posts/${POST_ID}/like`)
      .set("Authorization", `Bearer ${token}`)
      .send({ authorId: USER_ID })
      .expect(HttpStatus.INTERNAL_SERVER_ERROR);

    expect(response.body).toHaveProperty("error", "Database exploded");
  });
});
