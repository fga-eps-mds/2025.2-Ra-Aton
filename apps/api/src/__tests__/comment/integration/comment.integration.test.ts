import request from "supertest";
import app from "../../../app";
import { prismaMock } from "../../prisma-mock";
import HttpStatus from "http-status";
import bcrypt from "bcrypt";
import { ProfileType } from "@prisma/client";

describe("Testes de Integração de Comentários", () => {
  let autorDoPost: any;
  let usuarioComentarista: any;

  const postId = "550e8400-e29b-41d4-a716-446655440000";
  const authorPostId = "550e8400-e29b-41d4-a716-446655440001";
  const commentId = "550e8400-e29b-41d4-a716-446655440002";
  const commentId2 = "550e8400-e29b-41d4-a716-446655440003";
  const userId = "550e8400-e29b-41d4-a716-446655440004";

  beforeEach(async () => {
    jest.clearAllMocks();

    autorDoPost = {
      id: authorPostId,
      userName: "autorPost",
      email: "autor@example.com",
      name: "Autor do Post",
      profileType: ProfileType.ATLETICA,
      passwordHash: await bcrypt.hash("senhaAutor", 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    usuarioComentarista = {
      id: userId,
      userName: "comentarista",
      email: "comentarista@example.com",
      name: "Usuário Comentarista",
      profileType: ProfileType.JOGADOR,
      passwordHash: await bcrypt.hash("senhaComentarista", 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  const mockPost = {
    id: postId,
    title: "Post de Teste",
    content: "Conteúdo do post",
    type: "GENERAL",
    authorId: authorPostId,
    groupId: "group-123",
    eventDate: null,
    eventFinishDate: null,
    location: null,
    likesCount: 0,
    commentsCount: 0,
    attendancesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("deve listar comentários de um post via API com autenticação", async () => {
    prismaMock.user.findUnique.mockResolvedValue(usuarioComentarista);

    const resLogin = await request(app)
      .post("/login")
      .send({
        email: usuarioComentarista.email,
        password: "senhaComentarista",
      })
      .expect(HttpStatus.OK);

    const token = resLogin.body.token;

    const mockComments = [
      {
        id: commentId,
        content: "Primeiro comentário",
        postId,
        authorId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: commentId2,
        content: "Segundo comentário",
        postId,
        authorId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    prismaMock.comment.findMany.mockResolvedValue(mockComments as any);

    const res = await request(app)
      .get(`/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({
      id: commentId,
      content: "Primeiro comentário",
      postId,
    });
  });

  it("deve criar um novo comentário via API", async () => {
    prismaMock.user.findUnique.mockResolvedValue(usuarioComentarista);

    const resLogin = await request(app)
      .post("/login")
      .send({
        email: usuarioComentarista.email,
        password: "senhaComentarista",
      })
      .expect(HttpStatus.OK);

    const token = resLogin.body.token;

    const novoComentario = {
      id: commentId,
      content: "Novo comentário de teste",
      postId,
      authorId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.comment.create.mockResolvedValue(novoComentario as any);
    (prismaMock.post.update as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        authorId: userId,
        content: "Novo comentário de teste",
      })
      .expect(HttpStatus.CREATED);

    expect(res.body).toMatchObject({
      id: commentId,
      content: "Novo comentário de teste",
      postId,
      authorId: userId,
    });
  });

  it("deve retornar 400 ao criar comentário sem conteúdo", async () => {
    prismaMock.user.findUnique.mockResolvedValue(usuarioComentarista);

    const resLogin = await request(app)
      .post("/login")
      .send({
        email: usuarioComentarista.email,
        password: "senhaComentarista",
      })
      .expect(HttpStatus.OK);

    const token = resLogin.body.token;

    await request(app)
      .post(`/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        authorId: userId,
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it("deve retornar 400 ao criar comentário com conteúdo muito curto", async () => {
    prismaMock.user.findUnique.mockResolvedValue(usuarioComentarista);

    const resLogin = await request(app)
      .post("/login")
      .send({
        email: usuarioComentarista.email,
        password: "senhaComentarista",
      })
      .expect(HttpStatus.OK);

    const token = resLogin.body.token;

    await request(app)
      .post(`/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        authorId: userId,
        content: "a",
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it("deve obter um comentário por id via API", async () => {
    prismaMock.user.findUnique.mockResolvedValue(usuarioComentarista);

    const resLogin = await request(app)
      .post("/login")
      .send({
        email: usuarioComentarista.email,
        password: "senhaComentarista",
      })
      .expect(HttpStatus.OK);

    const token = resLogin.body.token;

    const mockComment = {
      id: commentId,
      content: "Comentário individual",
      postId,
      authorId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.comment.findUnique.mockResolvedValue(mockComment as any);

    const res = await request(app)
      .get(`/posts/${postId}/comments/${commentId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(res.body).toMatchObject({
      id: commentId,
      content: "Comentário individual",
      postId,
    });
  });

  it("deve retornar 400 com commentId inválido", async () => {
    prismaMock.user.findUnique.mockResolvedValue(usuarioComentarista);

    const resLogin = await request(app)
      .post("/login")
      .send({
        email: usuarioComentarista.email,
        password: "senhaComentarista",
      })
      .expect(HttpStatus.OK);

    const token = resLogin.body.token;

    await request(app)
      .get(`/posts/${postId}/comments/invalid-uuid`)
      .set("Authorization", `Bearer ${token}`)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it("deve retornar 401 ao tentar listar comentários sem autenticação", async () => {
    await request(app)
      .get(`/posts/${postId}/comments`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it("deve retornar 401 ao tentar criar comentário sem autenticação", async () => {
    await request(app)
      .post(`/posts/${postId}/comments`)
      .send({
        authorId: userId,
        content: "Novo comentário",
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it("deve retornar 401 ao tentar deletar comentário sem autenticação", async () => {
    await request(app)
      .delete(`/posts/${postId}/comments/${commentId}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
