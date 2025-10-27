import request from "supertest";
import { prisma } from "../../database/prisma.client";
import app from "../../app";

jest.mock("../../database/prisma.client", () => {
  return {
    prisma: {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    },
  };
});
const mockedPrisma = prisma as any as {
  user: {
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};
describe("users controller - updateUser & deleteUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });
  // passa o header Authorization esperado pelo app: "Bearer user:<id>"
  function authHeader(user: any) {
    return { Authorization: `Bearer user:${user.id}` };
  }

  describe("updateUser", () => {
    it("updates user successfully and returns 200 (authorized)", async () => {
      const userName = "jdoe";
      const userFound = { id: "user-id-1", userName, email: "old@example.com" };

      mockedPrisma.user.findUnique
        .mockResolvedValueOnce(userFound) // find by userName
        .mockResolvedValueOnce(null); // find by email (no conflict)

      const updated = {
        id: userFound.id,
        name: "New Name",
        userName: "newname",
        email: "new@example.com",
        profileType: null,
      };
      mockedPrisma.user.update.mockResolvedValueOnce(updated);

      const res = await request(app)
        .put(`/users/${userName}`)
        .set(authHeader({ id: userFound.id }))
        .send({
          name: "New Name",
          userName: "newname",
          email: "new@example.com",
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: updated.id,
        name: updated.name,
        userName: updated.userName,
        email: updated.email,
      });

      expect(mockedPrisma.user.findUnique).toHaveBeenCalled();
      expect(mockedPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userFound.id },
        data: expect.objectContaining({
          name: "New Name",
          userName: "newname",
          email: "new@example.com",
        }),
      });
    });

    it("returns 403 if auth user is different (forbidden)", async () => {
      const userName = "alice";
      const userFound = { id: "alice-id", userName, email: "a@x.com" };

      mockedPrisma.user.findUnique.mockResolvedValueOnce(userFound);

      const res = await request(app)
        .put(`/users/${userName}`)
        .set(authHeader({ id: "other-id" }))
        .send({ name: "irrelevant" });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        error: "Forbidden: não é possivel dar update em outro usuário",
      });
      expect(mockedPrisma.user.update).not.toHaveBeenCalled();
    });

    it("retorna 400 para formatos de email invalidos", async () => {
      const userName = "bob";
      const userFound = { id: "bob-id", userName, email: "b@x.com" };

      mockedPrisma.user.findUnique.mockResolvedValueOnce(userFound);

      const res = await request(app)
        .put(`/users/${userName}`)
        .set(authHeader({ id: userFound.id }))
        .send({ email: "invalid-email-format" });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Formato de email invalido" });
      expect(mockedPrisma.user.update).not.toHaveBeenCalled();
    });

    it("retorna 404 se o email já está em uso", async () => {
      const userName = "carol";
      const userFound = { id: "carol-id", userName, email: "c@x.com" };

      mockedPrisma.user.findUnique
        .mockResolvedValueOnce(userFound) // find by userName
        .mockResolvedValueOnce({
          id: "someone-else",
          email: "taken@example.com",
        }); // email conflict

      const res = await request(app)
        .put(`/users/${userName}`)
        .set(authHeader({ id: userFound.id }))
        .send({ email: "taken@example.com" });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Email já registrado" });
      expect(mockedPrisma.user.update).not.toHaveBeenCalled();
    });

    it("retorna 400 se não houver algo para mudar", async () => {
      const userName = "empty-change";
      const userFound = { id: "u-id", userName, email: "u@x.com" };

      mockedPrisma.user.findUnique.mockResolvedValueOnce(userFound);

      const res = await request(app)
        .put(`/users/${userName}`)
        .set(authHeader({ id: userFound.id }))
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Nenhuma mudança encontrada" });
      expect(mockedPrisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteUser", () => {
    it("deletes user successfully and returns 204 Deleta user e return 204 (authorized)", async () => {
      const userName = "deleteme";
      const userFound = { id: "del-id", userName, email: "d@x.com" };

      mockedPrisma.user.findUnique.mockResolvedValueOnce(userFound);
      mockedPrisma.user.delete.mockResolvedValueOnce(userFound);

      const res = await request(app)
        .delete(`/users/${userName}`)
        .set(authHeader({ id: userFound.id }));

      expect(res.status).toBe(204);
      expect(res.body).toEqual({});
      expect(mockedPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: userFound.id },
      });
    });

    it("retorna 404 se não encontrar o usuário", async () => {
      const userName = "notfound";

      mockedPrisma.user.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .delete(`/users/${userName}`)
        .set(authHeader({ id: "whatever" }));

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        error: `Usuário com username: ${userName} não encontrado`,
      });
      expect(mockedPrisma.user.delete).not.toHaveBeenCalled();
    });

    it("retorna 401 se o usuário não for autenticado", async () => {
      const userName = "someone";
      const userFound = { id: "s-id", userName, email: "s@x.com" };

      mockedPrisma.user.findUnique.mockResolvedValueOnce(userFound);

      const res = await request(app).delete(`/users/${userName}`);

      // seu app retorna uma mensagem de dev auth quando o header está faltando;
      // verifique a mensagem exata e ajuste a asserção abaixo conforme necessário.
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        error:
          "Faltando dev auth header: Use 'Authorization: Bearer user:<user_id>'",
      });
      expect(mockedPrisma.user.delete).not.toHaveBeenCalled();
    });

    it("retorna 403 se a autenticação do usuário for diferente (forbidden)", async () => {
      const userName = "protected";
      const userFound = { id: "protected-id", userName, email: "p@x.com" };

      mockedPrisma.user.findUnique.mockResolvedValueOnce(userFound);

      const res = await request(app)
        .delete(`/users/${userName}`)
        .set(authHeader({ id: "someone-else" }));

      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        error: "Forbidden: não é possivel dar update em outro usuário",
      });
      expect(mockedPrisma.user.delete).not.toHaveBeenCalled();
    });
  });
});
