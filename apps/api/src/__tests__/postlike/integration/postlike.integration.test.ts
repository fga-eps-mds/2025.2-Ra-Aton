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
  it("should like a post when no existing like is found", async () => {
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
      .send({ authorId: USER_ID }) // O validation exige authorId no body
      .expect(HttpStatus.CREATED);

    // Deve retornar a curtida criada
    expect(response.body).toMatchObject({
      id: "like-123",
      postId: POST_ID,
      userId: USER_ID,
    });

    // Confirma que update do contador foi chamado com +1
    expect(prismaMock.post.update).toHaveBeenCalledWith({
      where: { id: POST_ID },
      data: { likesCount: { increment: 1 } },
    });
  });

  // ===========================================================================
  // 2) REMOVER CURTIDA (UNLIKE)
  // ===========================================================================
  it("should unlike a post when existing like is found", async () => {
    const token = generateToken(USER_ID);

    // Mock: curtida JÁ EXISTE
    prismaMock.postLike.findFirst.mockResolvedValue({
      id: "like-987",
      postId: POST_ID,
      userId: USER_ID,
    });

    // Mock delete
    prismaMock.postLike.delete.mockResolvedValue({
      id: "like-987",
      postId: POST_ID,
      userId: USER_ID,
    });

    // Mock update contador -1
    prismaMock.post.update.mockResolvedValue({});

    const response = await request(app)
      .post(`/posts/${POST_ID}/like`)
      .set("Authorization", `Bearer ${token}`)
      .send({ authorId: USER_ID })
      .expect(HttpStatus.CREATED);

    // Deve retornar a curtida removida
    expect(response.body).toMatchObject({
      id: "like-987",
      postId: POST_ID,
      userId: USER_ID,
    });

    // Confirma update de -1
    expect(prismaMock.post.update).toHaveBeenCalledWith({
      where: { id: POST_ID },
      data: { likesCount: { increment: -1 } },
    });
  });

  // ===========================================================================
  // 3) ERRO — FALTA DE authorId NO BODY
  // ===========================================================================
    it("should return 400 when authorId is missing", async () => {
        const token = generateToken(USER_ID);

        const response = await request(app)
            .post(`/posts/${POST_ID}/like`)
            .set("Authorization", `Bearer ${token}`)
            .send({}) // body vazio
            .expect(HttpStatus.BAD_REQUEST);

        // Confirma status
        expect(response.status).toBe(400);

        // O middleware validateRequest retorna uma string simples no campo 'errors'
        expect(response.body).toBeDefined();
        expect(response.body.errors || response.body.error).toBeDefined();

        // O middleware está retornando apenas "Erro de validação"
        const msg = response.body.errors || response.body.error;

        // Então verificamos apenas que houve erro, não detalhes específicos
        expect(msg).toBe("Erro de validação");
    });


  // ===========================================================================
  // 4) ERRO — postId inválido (UUID inválido)
  // ===========================================================================
  it("should return 400 when postId is invalid", async () => {
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
  it("should return 500 when prisma throws an exception", async () => {
    const token = generateToken(USER_ID);

    // Força um erro no prisma
    prismaMock.postLike.findFirst.mockRejectedValue(
      new Error("Database exploded")
    );

    const response = await request(app)
      .post(`/posts/${POST_ID}/like`)
      .set("Authorization", `Bearer ${token}`)
      .send({ authorId: USER_ID })
      .expect(HttpStatus.INTERNAL_SERVER_ERROR);

    expect(response.body).toHaveProperty("error", "Database exploded");
  });
});
