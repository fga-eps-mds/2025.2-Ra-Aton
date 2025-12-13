import { Request, Response } from "express";
import httpStatus from "http-status";
import postController from "../../modules/post/post.controller";
import { userService } from "../../modules/user/user.service";
import { postService } from "../../modules/post/post.service";
import { ApiError } from "../../utils/ApiError";

jest.mock("../../modules/post/post.service");
jest.mock("../../modules/user/user.service");

describe("PostController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    sendMock = jest.fn().mockReturnThis();

    res = {
      status: statusMock,
      json: jsonMock,
      send: sendMock,
    };
  });

  describe("listPosts", () => {
    it("deve lançar ApiError se userId não for fornecido (nem no body nem no user)", async () => {
      req = {
        body: {},
        query: { limit: "10", page: "1" },
      } as any; 

      await expect(
        postController.listPosts(req as Request, res as Response),
      ).rejects.toBeInstanceOf(ApiError);

      await expect(
        postController.listPosts(req as Request, res as Response),
      ).rejects.toThrow("UserId é obrigatório no corpo da requisição");
    });

    it("deve aceitar userId vindo de req.user se não estiver no body", async () => {
        const mockResult = { page: 1, limit: 10, items: [] };
        (postService.listPosts as jest.Mock).mockResolvedValue(mockResult);
  
        req = { 
          body: {}, 
          user: { id: "user-auth" },
          query: { limit: "10", page: "1" } 
        } as any;
  
        await postController.listPosts(req as Request, res as Response);
  
        expect(postService.listPosts).toHaveBeenCalledWith(10, 1, "user-auth");
        expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      });

    it("deve lançar ApiError se limit > 50", async () => {
      req = {
        body: { userId: "1" },
        query: { limit: "100", page: "1" },
      };

      await expect(
        postController.listPosts(req as Request, res as Response),
      ).rejects.toBeInstanceOf(ApiError);

      await expect(
        postController.listPosts(req as Request, res as Response),
      ).rejects.toThrow("O limite não pode ser maior que 50");
    });

    it("deve usar valores padrão (limit 10, page 1) quando query params forem inválidos (NaN)", async () => {
      const mockResult = { page: 1, limit: 10, items: [] };
      (postService.listPosts as jest.Mock).mockResolvedValue(mockResult);

      req = { body: { userId: "1" }, query: { limit: "abc", page: "zzz" } };

      await postController.listPosts(req as Request, res as Response);


      expect(postService.listPosts).toHaveBeenCalledWith(10, 1, "1");
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("deve retornar 200 com resultado paginado (caminho feliz)", async () => {
      const mockResult = {
        page: 1,
        limit: 10,
        items: [{ id: "1", title: "t" }],
      };

      (postService.listPosts as jest.Mock).mockResolvedValue(mockResult);

      req = { body: { userId: "1" }, query: { limit: "10", page: "1" } };
      await postController.listPosts(req as Request, res as Response);

      expect(postService.listPosts).toHaveBeenCalledWith(10, 1, "1");
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("getPostById", () => {
    it("deve retornar 400 se id não for fornecido nos params", async () => {
      req = { params: {} };

      await postController.getPostById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "O id é necessário para buscar a postagem",
      });
    });

    it("deve retornar 200 com o post", async () => {
      const mockPost = { id: "p1", title: "x" };
      (postService.getPostById as jest.Mock).mockResolvedValue(mockPost);

      req = { params: { id: "p1" } };

      await postController.getPostById(req as Request, res as Response);

      expect(postService.getPostById).toHaveBeenCalledWith("p1");
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockPost);
    });
  });


  describe("createPost", () => {
    it("deve retornar 404 se o autor não for encontrado", async () => {
      req = { body: {}, user: { id: "unknown_user" } } as any;
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await postController.createPost(req as Request, res as Response);

      expect(userService.getUserById).toHaveBeenCalledWith("unknown_user");
      expect(res.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        message: "Autor da postagem não encontrado",
      });
    });

    it("deve criar post e retornar 201 (caminho feliz)", async () => {
      const payload = { content: "X", title: "Novo", eventDate: "2023-01-01" };
      const author = { id: "user123", name: "John" };
      const created = { ...payload, id: "p1", author };

      (userService.getUserById as jest.Mock).mockResolvedValue(author);
      (postService.createPost as jest.Mock).mockResolvedValue(created);

      req = { body: payload, user: { id: "user123" } } as any;

      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      await postController.createPost(req as Request, res as Response);

      expect(postService.createPost).toHaveBeenCalledWith({
        ...payload,
        author: author,
      });
      expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(created);
      
      logSpy.mockRestore();
    });

    it("deve propagar erro se o service falhar (sem try/catch no controller)", async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue({ id: "u1" });
      (postService.createPost as jest.Mock).mockRejectedValue(new Error("DB Error"));

      req = { body: {}, user: { id: "u1" } } as any;

      await expect(
        postController.createPost(req as Request, res as Response),
      ).rejects.toThrow("DB Error");
    });
  });

  describe("updatePost", () => {
    it("deve retornar 400 se o id não for fornecido", async () => {
      req = { params: {} }; // Sem ID

      await postController.updatePost(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "O id é necessário para atualizar a postagem",
      });
    });

    it("deve retornar 200 ao atualizar com sucesso", async () => {
      const updated = { id: "p1", title: "novo" };
      (postService.updatePost as jest.Mock).mockResolvedValue(updated);

      req = {
        params: { id: "p1" },
        body: { title: "novo" },
        user: { id: "user123" },
      } as any;

      await postController.updatePost(req as Request, res as Response);

      expect(postService.updatePost).toHaveBeenCalledWith("p1", "user123", {
        title: "novo",
      });
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it("deve capturar ApiError e retornar o status code correto", async () => {
      // Simula um erro de negócio (ex: usuário não autorizado a editar)
      const error = new ApiError(httpStatus.FORBIDDEN, "Sem permissão");
      (postService.updatePost as jest.Mock).mockRejectedValue(error);

      req = {
        params: { id: "p1" },
        user: { id: "user123" },
        body: {},
      } as any;

      await postController.updatePost(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({ message: "Sem permissão" });
    });

    it("deve capturar Error genérico e retornar 500", async () => {
      (postService.updatePost as jest.Mock).mockRejectedValue(new Error("Crash"));

      req = {
        params: { id: "p1" },
        user: { id: "user123" },
        body: {},
      } as any;

      await postController.updatePost(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erro ao atualizar a postagem",
      });
    });
  });

  describe("deletePost", () => {
    it("deve retornar 400 se o id não for fornecido", async () => {
        req = { params: {} }; // Sem ID
  
        await postController.deletePost(req as Request, res as Response);
  
        expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
          message: "O id é necessário para excluir a postagem",
        });
      });

    it("deve deletar e retornar 204", async () => {
      (postService.deletePost as jest.Mock).mockResolvedValue(undefined);

      req = { params: { id: "p1" }, user: { id: "user123" } } as any;

      await postController.deletePost(req as Request, res as Response);

      expect(postService.deletePost).toHaveBeenCalledWith("p1", "user123");
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });

    it("deve capturar ApiError e retornar o status code correto", async () => {
        const error = new ApiError(httpStatus.NOT_FOUND, "Post não existe");
        (postService.deletePost as jest.Mock).mockRejectedValue(error);
  
        req = { params: { id: "p1" }, user: { id: "user123" } } as any;
  
        await postController.deletePost(req as Request, res as Response);
  
        expect(res.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
        expect(res.json).toHaveBeenCalledWith({ message: "Post não existe" });
      });
  
      it("deve capturar Error genérico e retornar 500", async () => {
        (postService.deletePost as jest.Mock).mockRejectedValue(new Error("Crash DB"));
  
        req = { params: { id: "p1" }, user: { id: "user123" } } as any;
  
        await postController.deletePost(req as Request, res as Response);
  
        expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({
          message: "Erro ao excluir a postagem",
        });
      });
  });
});