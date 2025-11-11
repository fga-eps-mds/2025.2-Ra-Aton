import postController from "../../modules/post/post.controller";
import { postService } from "../../modules/post/post.service";
import { userService } from "../../modules/user/user.service";
import { Request, Response } from "express";
import HttpStatus from "http-status";
import { ApiError } from "../../utils/ApiError";

// ===================================
// 1. Mocks de Dependência
// ===================================

// Mock dos serviços externos
jest.mock("../../modules/post/post.service");
jest.mock("../../modules/user/user.service");

// ===================================
// 2. Variáveis e Funções de Mock
// ===================================

const AUTH_USER_ID = "auth-user-id";
const POST_ID = "post-uuid-456";
const OTHER_USER_ID = "other-user-id-789";

const mockUser = { id: AUTH_USER_ID, name: "Test User" };
const mockPost = {
  id: POST_ID,
  title: "Test Post",
  content: "Content",
  authorId: AUTH_USER_ID,
};
const mockPosts = [mockPost];
const updateData = { content: "Updated Content" };
const createData = { title: "New Post", content: "Content", type: "GENERAL" };

// Função auxiliar para criar mocks de Request e Response
const getMockReqRes = (
  options: {
    body?: any;
    params?: any;
    user?: any; // Simula (req as any).user do middleware 'auth'
  } = {},
) => {
  const req = {
    body: options.body || {},
    params: options.params || {},
    user: options.user || { id: AUTH_USER_ID }, // Default user ID para rotas protegidas
  } as unknown as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(), // Para o 204 (NO_CONTENT)
  } as unknown as Response;

  return { req, res };
};

// ===================================
// 3. Suíte de Testes
// ===================================

describe("PostController", () => {
  // Limpar mocks entre testes
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------
  // listPosts (GET /post)
  // -----------------------------------
  describe("listPosts", () => {
    it("deve chamar getAllPosts e retornar todos os posts com status 200", async () => {
      // Arrange
      const { req, res } = getMockReqRes();
      (postService.getAllPosts as jest.Mock).mockResolvedValue(mockPosts);

      // Act
      await postController.listPosts(req, res);

      // Assert
      expect(postService.getAllPosts).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockPosts);
    });

    it("deve propagar erros do service (e.g., erro de banco de dados)", async () => {
      // Arrange
      const { req, res } = getMockReqRes();
      const mockError = new Error("Database connection failed");
      (postService.getAllPosts as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert (a propagação do erro é esperada, pois o controller não tem bloco try/catch)
      await expect(postController.listPosts(req, res)).rejects.toThrow(
        mockError,
      );
    });
  });

  // -----------------------------------
  // createPost (POST /post)
  // -----------------------------------
  describe("createPost", () => {
    it("deve criar uma postagem e retornar 200 (OK)", async () => {
      // Arrange
      const { req, res } = getMockReqRes({ body: createData });
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (postService.createPost as jest.Mock).mockResolvedValue(mockPost);

      // Act
      await postController.createPost(req, res);

      // Assert
      expect(userService.getUserById).toHaveBeenCalledWith(AUTH_USER_ID);
      expect(postService.createPost).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createData,
          author: mockUser,
        }),
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockPost);
    });

    it("deve retornar 404 se o autor não for encontrado", async () => {
      // Arrange
      const { req, res } = getMockReqRes({ body: createData });
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      // Act
      await postController.createPost(req, res);

      // Assert
      expect(userService.getUserById).toHaveBeenCalledWith(AUTH_USER_ID);
      expect(postService.createPost).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        message: "Autor da postagem não encontrado",
      });
    });

    it("deve propagar erros do service (e.g., validação de negócio)", async () => {
      // Arrange
      const { req, res } = getMockReqRes({ body: createData });
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      const mockApiError = new ApiError(
        HttpStatus.BAD_REQUEST,
        "Dados de evento obrigatórios faltantes",
      );
      (postService.createPost as jest.Mock).mockRejectedValue(mockApiError);

      // Act & Assert (o erro é propagado para o catchAsync/global error handler)
      await expect(postController.createPost(req, res)).rejects.toThrow(
        mockApiError,
      );
    });
  });

  // -----------------------------------
  // updatePost (PATCH /post/:id)
  // -----------------------------------
  describe("updatePost", () => {
    const updatedPostMock = { ...mockPost, ...updateData };

    it("deve atualizar a postagem e retornar 200 (OK) em caso de sucesso", async () => {
      // Arrange
      const { req, res } = getMockReqRes({
        params: { id: POST_ID },
        body: updateData,
      });
      (postService.updatePost as jest.Mock).mockResolvedValue(updatedPostMock);

      // Act
      await postController.updatePost(req, res);

      // Assert
      expect(postService.updatePost).toHaveBeenCalledWith(
        POST_ID,
        AUTH_USER_ID,
        updateData,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(updatedPostMock);
    });

    it("deve retornar 400 se o id do post estiver faltando", async () => {
      // Arrange
      const { req, res } = getMockReqRes({ params: { id: undefined } });

      // Act
      await postController.updatePost(req, res);

      // Assert
      expect(postService.updatePost).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "O id é necessesário para atualizar a postagem",
      });
    });

    it("deve retornar 404 para ApiError(NOT_FOUND)", async () => {
      // Arrange
      const { req, res } = getMockReqRes({ params: { id: POST_ID } });
      (postService.updatePost as jest.Mock).mockRejectedValue(
        new ApiError(HttpStatus.NOT_FOUND, "Postagem não encontrada"),
      );

      // Act
      await postController.updatePost(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        message: "Postagem não encontrada",
      });
    });

    it("deve retornar 403 para ApiError(FORBIDDEN)", async () => {
      // Arrange
      const { req, res } = getMockReqRes({ params: { id: POST_ID } });
      (postService.updatePost as jest.Mock).mockRejectedValue(
        new ApiError(
          HttpStatus.FORBIDDEN,
          "Você não tem permissão para atualizar esta postagem",
        ),
      );

      // Act
      await postController.updatePost(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({
        message: "Você não tem permissão para atualizar esta postagem",
      });
    });

    it("deve retornar 500 para erros não-ApiError", async () => {
      // Arrange
      const { req, res } = getMockReqRes({ params: { id: POST_ID } });
      (postService.updatePost as jest.Mock).mockRejectedValue(
        new Error("Erro de conexão com o banco"),
      );

      // Act
      await postController.updatePost(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erro ao atualizar a postagem",
      });
    });
  });

  // -----------------------------------
  // deletePost (DELETE /post/:id)
  // -----------------------------------
  describe("deletePost", () => {
    it("deve deletar a postagem e retornar 204 (NO_CONTENT) em caso de sucesso", async () => {
      // Arrange
      const { req, res } = getMockReqRes({ params: { id: POST_ID } });
      (postService.deletePost as jest.Mock).mockResolvedValue(undefined);

      // Act
      await postController.deletePost(req, res);

      // Assert
      expect(postService.deletePost).toHaveBeenCalledWith(
        POST_ID,
        AUTH_USER_ID,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("deve retornar 400 se o id do post estiver faltando", async () => {
      // Arrange
      const { req, res } = getMockReqRes({ params: { id: undefined } });

      // Act
      await postController.deletePost(req, res);

      // Assert
      expect(postService.deletePost).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "O id é necessesário para excluir a postagem",
      });
    });

    it("deve retornar 404 para ApiError(NOT_FOUND)", async () => {
      // Arrange
      const { req, res } = getMockReqRes({ params: { id: POST_ID } });
      (postService.deletePost as jest.Mock).mockRejectedValue(
        new ApiError(HttpStatus.NOT_FOUND, "Postagem não encontrada"),
      );

      // Act
      await postController.deletePost(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        message: "Postagem não encontrada",
      });
    });

    it("deve retornar 500 para erros não-ApiError", async () => {
      // Arrange
      const { req, res } = getMockReqRes({ params: { id: POST_ID } });
      (postService.deletePost as jest.Mock).mockRejectedValue(
        new Error("Erro interno"),
      );

      // Act
      await postController.deletePost(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erro ao excluir a postagem",
      });
    });
  });
});
