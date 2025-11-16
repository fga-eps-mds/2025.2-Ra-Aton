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

// Novo mock para resultado paginado
const mockPaginatedResult = {
  data: mockPosts,
  meta: {
    totalItems: 1,
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  },
};

// Função auxiliar para criar mocks de Request e Response
const getMockReqRes = (
  options: {
    body?: any;
    params?: any;
    query?: any;
    user?: any; // Simula (req as any).user do middleware 'auth'
  } = {},
) => {
  const req = {
    body: options.body || {},
    params: options.params || {},
    query: options.query || {}, // Adicionado query para testar paginação
    user: options.user === undefined ? { id: AUTH_USER_ID } : options.user, 
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
    
    it("deve chamar listPosts com parâmetros padrão e retornar posts paginados com status 200", async () => {
      // Arrange
      // Simular o req.body.userId e req.query vazio (usará os defaults)
      const { req, res } = getMockReqRes({ 
          body: { userId: AUTH_USER_ID }, // userId é obrigatório no controller
          user: { id: AUTH_USER_ID } 
      }); 
      (postService.listPosts as jest.Mock).mockResolvedValue(mockPaginatedResult);

      // Act
      await postController.listPosts(req, res);

      // Assert
      expect(postService.listPosts).toHaveBeenCalledWith(10, 1, AUTH_USER_ID);
      expect(postService.listPosts).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockPaginatedResult);
    });

    it("deve chamar listPosts com parâmetros de paginação e retornar 200", async () => {
      // Arrange
      const limit = 5;
      const page = 2;
      const { req, res } = getMockReqRes({ 
          query: { limit: limit.toString(), page: page.toString() }, 
          body: { userId: OTHER_USER_ID },
          user: { id: AUTH_USER_ID }
        });
      (postService.listPosts as jest.Mock).mockResolvedValue(mockPaginatedResult);

      // Act
      await postController.listPosts(req, res);

      // Assert
      expect(postService.listPosts).toHaveBeenCalledWith(limit, page, OTHER_USER_ID);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockPaginatedResult);
    });
    
    it("deve retornar 400 se o limite for maior que 50", async () => {
      // Arrange
      const { req, res } = getMockReqRes({ 
          query: { limit: "51", page: "1" }, 
          body: { userId: AUTH_USER_ID },
          user: { id: AUTH_USER_ID }
        });
      
      // Act & Assert (o erro é lançado e deve ser tratado pelo catchAsync/global error handler)
      await expect(postController.listPosts(req, res)).rejects.toThrow(
        new ApiError(HttpStatus.BAD_REQUEST, "O limite não pode ser maior que 50"),
      );
      expect(postService.listPosts).not.toHaveBeenCalled();
    });

    it("deve retornar 400 se o userId estiver faltando no body", async () => {
      // Arrange
      const { req, res } = getMockReqRes({ 
          body: { userId: undefined },
          // CORRIGIDO: Passar um user vazio ({}) garante que (req as any).user?.id seja undefined,
          // forçando a validação do controller a falhar.
          user: {}, 
        });

      // Act & Assert (o erro é lançado e deve ser tratado pelo catchAsync/global error handler)
      await expect(postController.listPosts(req, res)).rejects.toThrow(
        new ApiError(HttpStatus.BAD_REQUEST, "UserId é obrigatório no corpo da requisição"),
      );
      expect(postService.listPosts).not.toHaveBeenCalled();
    });

    it("deve propagar erros do service (e.g., erro de banco de dados)", async () => {
      // Arrange
      const { req, res } = getMockReqRes({ body: { userId: AUTH_USER_ID } });
      const mockError = new Error("Database connection failed");
      (postService.listPosts as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert (a propagação do erro é esperada)
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
        message: "O id é necessário para atualizar a postagem",
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
        message: "O id é necessário para excluir a postagem",
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
