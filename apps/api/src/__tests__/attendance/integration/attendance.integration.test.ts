import request from "supertest";
import app from "../../../app";
import { prismaMock } from "../../prisma-mock";
import HttpStatus from "http-status";
import bcrypt from "bcrypt";

describe("Testes de Integração de Presença", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it("deve alternar presença (criar) quando usuário não está presente via API", async () => {
    const postId = "post-123";
    const userId = "user-456";
    const usuarioExistente = {
      id: userId,
      userName: "usuarioPresenca",
      email: "presenca@example.com",
      name: "Usuário Presença",
      profileType: "JOGADOR",
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
      id: "presenca-789",
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
});