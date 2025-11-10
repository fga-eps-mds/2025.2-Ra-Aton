import request from "supertest";
import app from "../../../app";
import { prismaMock } from "../../prisma-mock";
import { PostType, ProfileType } from "@prisma/client";
import HttpStatus from "http-status";

// ===================================
// 1. Configuração de Mocks e Dados
// ===================================

const AUTH_USER_ID = "auth-user-id-100";
const OTHER_USER_ID = "other-user-id-200";
const POST_ID = "0e0a5198-a379-4d6d-8b30-c9a96e1919d8";
const BASE_URL = "/post";

const mockAuthor = {
  id: AUTH_USER_ID,
  userName: "testauthor",
  email: "author@test.com",
  name: "Test Author",
  profileType: ProfileType.ATLETICA,
  passwordHash: "hashedPassword",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockGroup = { id: 'group-id-123', name: 'Test Group' };

const mockPost = {
  id: POST_ID,
  title: "Test Integration Post",
  content: "Content",
  type: PostType.GENERAL,
  authorId: AUTH_USER_ID,
  groupId: mockGroup.id,
  eventDate: null,
  eventFinishDate: null,
  location: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  author: mockAuthor,
  group: mockGroup,
};

// **IMPORTANTE:** Mock do middleware de Autenticação
jest.mock("../../../middlewares/auth", () => ({
  auth: (req: any, res: any, next: any) => {
    req.user = { id: AUTH_USER_ID }; 
    next();
  },
}));

// Mock do userService.getUserById, usado dentro de postController.createPost
jest.mock("../../../modules/user/user.service", () => ({
  userService: {
    getUserById: jest.fn(async (id: string) => {
      if (id === AUTH_USER_ID) return mockAuthor;
      return null; 
    }),
  },
}));


describe("Post Module Integration Tests (Prisma Mock)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------
  // GET /post - listPosts (Pública)
  // -----------------------------------
  describe(`GET ${BASE_URL}`, () => {
    it("deve retornar todos os posts com status 200 (OK)", async () => {
      // Arrange
      prismaMock.post.findMany.mockResolvedValue([mockPost] as any);

      // Act
      const response = await request(app).get(BASE_URL).expect(HttpStatus.OK);

      // Assert
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe(mockPost.title);
      expect(prismaMock.post.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
    });
  });

  // -----------------------------------
  // POST /post - createPost (Protegida)
  // -----------------------------------
  describe(`POST ${BASE_URL}`, () => {
    const postDataGeneral = {
      title: "New Post",
      type: "GENERAL",
      content: "Content",
      groupId: mockGroup.id,
    };

    const postDataEvent = {
      title: "New Event",
      type: "EVENT",
      content: "Event Details",
      eventDate: new Date().toISOString(),
      eventFinishDate: new Date().toISOString(),
      location: "Venue",
      groupId: mockGroup.id,
    };

    it("deve criar um post GENERAL com sucesso e retornar 200 (OK)", async () => {
      // Arrange
      const expectedPost = { 
        ...mockPost, 
        title: postDataGeneral.title, 
        content: postDataGeneral.content 
      };
      prismaMock.post.create.mockResolvedValue(expectedPost as any);
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockAuthor);

      // Act
      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", "Bearer mocktoken") 
        .send(postDataGeneral)
        .expect(HttpStatus.OK);

      // Assert
      expect(prismaMock.post.create).toHaveBeenCalledTimes(1);
      expect(response.body.title).toBe(postDataGeneral.title);
    });

    it("deve retornar 400 se a validação Zod falhar (título muito curto)", async () => {
      const invalidData = { ...postDataGeneral, title: "a" };

      // Act
      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", "Bearer mocktoken")
        .send(invalidData)
        .expect(HttpStatus.BAD_REQUEST);

      // Assert: Verifica a mensagem de erro do Zod
      expect(response.body.error).toContain("Erro de validação");
      expect(prismaMock.post.create).not.toHaveBeenCalled();
    });

    it("deve retornar 400 se o service lançar ApiError (ex: evento sem localização)", async () => {
      // A validação de negócio (EVENT sem location) está no Service
      const invalidEventData = {
        title: "New Event",
        type: "EVENT",
        content: "Event Details",
        eventDate: new Date().toISOString(),
        eventFinishDate: new Date().toISOString(),
        groupId: mockGroup.id,
      };

      // Act
      const response = await request(app)
        .post(BASE_URL)
        .set("Authorization", "Bearer mocktoken")
        .send(invalidEventData)
        .expect(HttpStatus.BAD_REQUEST);
      
      // Assert: Verifica a mensagem do ApiError do Service (tratado pelo Global Error Handler)
      expect(response.body.error).toContain("Data de inicio, Data de terminó e Localização do evento são obrigatórios");
      expect(prismaMock.post.create).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------
  // PATCH /post/:id - updatePost (Protegida)
  // -----------------------------------
  describe(`PATCH ${BASE_URL}/:id`, () => {
    const URL_WITH_ID = `${BASE_URL}/${POST_ID}`;
    const updatePayload = { content: "Updated Content" };
    const updatedPostMock = { ...mockPost, ...updatePayload };

    it("deve atualizar a postagem e retornar 200 (OK) se for o autor", async () => {
      // Arrange: Simular que o post foi encontrado e atualizado
      prismaMock.post.findUnique.mockResolvedValue(mockPost as any);
      prismaMock.post.update.mockResolvedValue(updatedPostMock as any);

      // Act
      const response = await request(app)
        .patch(URL_WITH_ID)
        .set("Authorization", "Bearer mocktoken")
        .send(updatePayload)
        .expect(HttpStatus.OK);

      // Assert
      expect(prismaMock.post.update).toHaveBeenCalledWith({
        where: { id: POST_ID },
        data: updatePayload,
      });
      expect(response.body.content).toBe(updatePayload.content);
    });

    it("deve retornar 403 se o usuário autenticado não for o autor (Forbidden)", async () => {
      // Arrange: Simular que o post pertence a outro usuário
      const postFromOtherUser = { ...mockPost, authorId: OTHER_USER_ID };
      prismaMock.post.findUnique.mockResolvedValue(postFromOtherUser as any);

      // Act
      const response = await request(app)
        .patch(URL_WITH_ID)
        .set("Authorization", "Bearer mocktoken")
        .send(updatePayload)
        .expect(HttpStatus.FORBIDDEN);

      // Assert: O controller trata o ApiError 403
      expect(response.body).toEqual({
        message: "Você não tem permissão para atualizar esta postagem",
      });
      expect(prismaMock.post.update).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------
  // DELETE /post/:id - deletePost (Protegida)
  // -----------------------------------
  describe(`DELETE ${BASE_URL}/:id`, () => {
    const URL_WITH_ID = `${BASE_URL}/${POST_ID}`;

    it("deve excluir a postagem e retornar 204 (NO_CONTENT) se for o autor", async () => {
      // Arrange: Simular que o post foi encontrado e excluído
      prismaMock.post.findUnique.mockResolvedValue(mockPost as any);
      prismaMock.post.delete.mockResolvedValue(mockPost as any); 

      // Act
      const response = await request(app)
        .delete(URL_WITH_ID)
        .set("Authorization", "Bearer mocktoken")
        .expect(HttpStatus.NO_CONTENT);

      // Assert
      expect(response.text).toBe("");
      expect(prismaMock.post.delete).toHaveBeenCalledWith({
        where: { id: POST_ID },
      });
    });

    it("deve retornar 400 se o id do post for inválido (Zod UUID)", async () => {
      // Act: Tenta deletar com um ID que falha na validação Zod
      const response = await request(app)
        .delete(`${BASE_URL}/invalid-uuid-id`)
        .set("Authorization", "Bearer mocktoken")
        .expect(HttpStatus.BAD_REQUEST);

      // Assert: Verifica a mensagem de erro do Zod
      expect(response.body.error).toContain("Erro de validação");
      expect(prismaMock.post.findUnique).not.toHaveBeenCalled();
    });

    it("deve retornar 403 se o usuário autenticado não for o autor (Forbidden)", async () => {
      // Arrange
      const postFromOtherUser = { ...mockPost, authorId: OTHER_USER_ID };
      prismaMock.post.findUnique.mockResolvedValue(postFromOtherUser as any);

      // Act
      const response = await request(app)
        .delete(URL_WITH_ID)
        .set("Authorization", "Bearer mocktoken")
        .expect(HttpStatus.FORBIDDEN);

      // Assert
      expect(response.body).toEqual({
        message: "Você não tem permissão para excluir esta postagem",
      });
      expect(prismaMock.post.delete).not.toHaveBeenCalled();
    });
  });
});