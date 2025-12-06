import request from "supertest";
import app from "../../../app";
import { prismaMock } from "../../prisma-mock";
import HttpStatus from "http-status";
import bcrypt from "bcrypt";
import { ProfileType } from "@prisma/client";

describe("Testes de Integração de Presença", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it("deve alternar presença (criar) quando usuário não está presente via API", async () => {
    const postId = "550e8400-e29b-41d4-a716-446655440000";
    const userId = "550e8400-e29b-41d4-a716-446655440001";
    const usuarioExistente = {
      id: userId,
      userName: "usuarioPresenca",
      email: "presenca@example.com",
      name: "Usuário Presença",
      profileType: ProfileType.JOGADOR,
      passwordHash: await bcrypt.hash("senhaPresenca", 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.user.findUnique.mockResolvedValue(usuarioExistente);

    const resLogin = await request(app)
      .post("/login")
      .send({
        email: usuarioExistente.email,
        password: "senhaPresenca",
      })
      .expect(HttpStatus.OK);

    const token = resLogin.body.token;

    const novaPresenca = {
      id: "550e8400-e29b-41d4-a716-446655440002",
      postId,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prismaMock.attendance.findFirst.mockResolvedValue(null);
    prismaMock.attendance.create.mockResolvedValue(novaPresenca as any);
    (prismaMock.post.update as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/posts/${postId}/attendance`)
      .set("Authorization", `Bearer ${token}`)
      .send({ authorId: userId })
      .expect(HttpStatus.CREATED);

    expect(res.body).toMatchObject({
      id: novaPresenca.id,
      postId,
      userId,
    });
  });

  it("deve alternar presença (deletar) quando usuário já está presente via API", async () => {
    const postId = "550e8400-e29b-41d4-a716-446655440003";
    const userId = "550e8400-e29b-41d4-a716-446655440004";
    const usuarioExistente = {
      id: userId,
      userName: "usuarioPresenca",
      email: "presenca@example.com",
      name: "Usuário Presença",
      profileType: ProfileType.JOGADOR,
      passwordHash: await bcrypt.hash("senhaPresenca", 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.user.findUnique.mockResolvedValue(usuarioExistente);

    const resLogin = await request(app)
      .post("/login")
      .send({
        email: usuarioExistente.email,
        password: "senhaPresenca",
      })
      .expect(HttpStatus.OK);

    const token = resLogin.body.token;

    const presencaExistente = {
      id: "550e8400-e29b-41d4-a716-446655440005",
      postId,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prismaMock.attendance.findFirst.mockResolvedValue(presencaExistente as any);
    prismaMock.attendance.delete.mockResolvedValue(presencaExistente as any);
    (prismaMock.post.update as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/posts/${postId}/attendance`)
      .set("Authorization", `Bearer ${token}`)
      .send({ authorId: userId })
      .expect(HttpStatus.CREATED);

    expect(res.body).toMatchObject({
      id: presencaExistente.id,
      postId,
      userId,
    });

    expect(prismaMock.attendance.delete).toHaveBeenCalledWith({
      where: { id: presencaExistente.id },
    });
  });

  it("deve retornar 401 quando tentar alternar presença sem autorização", async () => {
    const postId = "550e8400-e29b-41d4-a716-446655440006";
    const userId = "550e8400-e29b-41d4-a716-446655440007";

    await request(app)
      .post(`/posts/${postId}/attendance`)
      .send({ authorId: userId })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it("deve retornar 400 quando postId é inválido (não é UUID)", async () => {
    const usuarioExistente = {
      id: "550e8400-e29b-41d4-a716-446655440008",
      userName: "usuarioPresenca",
      email: "presenca@example.com",
      name: "Usuário Presença",
      profileType: ProfileType.JOGADOR,
      passwordHash: await bcrypt.hash("senhaPresenca", 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.user.findUnique.mockResolvedValue(usuarioExistente);

    const resLogin = await request(app)
      .post("/login")
      .send({
        email: usuarioExistente.email,
        password: "senhaPresenca",
      })
      .expect(HttpStatus.OK);

    const token = resLogin.body.token;

    await request(app)
      .post(`/posts/invalid-uuid/attendance`)
      .set("Authorization", `Bearer ${token}`)
      .send({ authorId: usuarioExistente.id })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it("deve retornar 400 quando authorId está ausente no body", async () => {
    const postId = "550e8400-e29b-41d4-a716-446655440009";
    const usuarioExistente = {
      id: "550e8400-e29b-41d4-a716-446655440010",
      userName: "usuarioPresenca",
      email: "presenca@example.com",
      name: "Usuário Presença",
      profileType: ProfileType.JOGADOR,
      passwordHash: await bcrypt.hash("senhaPresenca", 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.user.findUnique.mockResolvedValue(usuarioExistente);

    const resLogin = await request(app)
      .post("/login")
      .send({
        email: usuarioExistente.email,
        password: "senhaPresenca",
      })
      .expect(HttpStatus.OK);

    const token = resLogin.body.token;

    await request(app)
      .post(`/posts/${postId}/attendance`)
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .expect(HttpStatus.BAD_REQUEST);
  });
});
