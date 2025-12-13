import { Request, Response } from "express";
import httpStatus from "http-status";
import { commentController } from "../../modules/comment/comment.controller";
import commentService from "../../modules/comment/comment.service";
import { ApiError } from "../../utils/ApiError";

jest.mock("../../modules/comment/comment.service");

describe("CommentController", () => {
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

  describe("listComments", () => {
    it("deve retornar 204 quando não houver comentários (array vazio)", async () => {
      (commentService.listComments as jest.Mock).mockResolvedValue([]);

      req = {};

      await commentController.listComments(req as Request, res as Response);

      expect(commentService.listComments).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });

    it("deve retornar 204 quando o retorno for null/undefined", async () => {
      (commentService.listComments as jest.Mock).mockResolvedValue(null);

      req = {};

      await commentController.listComments(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });

    it("deve retornar 200 com a lista de comentários", async () => {
      const items = [{ id: "c1", content: "x", postId: "p1", authorId: "u1" }];
      (commentService.listComments as jest.Mock).mockResolvedValue(items);

      req = {};

      await commentController.listComments(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(items);
    });

    it("deve capturar ApiError e retornar o status correto", async () => {
      const error = new ApiError(httpStatus.BAD_REQUEST, "Erro de API");
      (commentService.listComments as jest.Mock).mockRejectedValue(error);

      req = {};

      await commentController.listComments(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: "Erro de API" });
    });

    it("deve capturar Error genérico e retornar 500", async () => {
      const error = new Error("Erro de Banco");
      (commentService.listComments as jest.Mock).mockRejectedValue(error);

      req = {};

      await commentController.listComments(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erro ao listar comentários",
      });
    });
  });

  describe("deleteCommentAsPostAuthor", () => {
    it("deve retornar 400 se o id não for fornecido nos params", async () => {
      req = { params: {} }; // Sem ID

      await commentController.deleteCommentAsPostAuthor(
        req as Request,
        res as Response
      );

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "O id é necessesário para excluir os comentários da postagem",
      });
    });

    it("deve deletar e retornar 204 (sucesso)", async () => {
      (commentService.deleteComment as jest.Mock).mockResolvedValue(undefined);

      req = { params: { id: "c1" }, user: { id: "u1" } } as any;

      await commentController.deleteCommentAsPostAuthor(
        req as Request,
        res as Response
      );

      expect(commentService.deleteComment).toHaveBeenCalledWith("c1", "u1");
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });

    it("deve capturar ApiError e retornar o status correto", async () => {
      const error = new ApiError(httpStatus.FORBIDDEN, "Não autorizado");
      (commentService.deleteComment as jest.Mock).mockRejectedValue(error);

      req = { params: { id: "c1" }, user: { id: "u1" } } as any;

      await commentController.deleteCommentAsPostAuthor(
        req as Request,
        res as Response
      );

      expect(res.status).toHaveBeenCalledWith(httpStatus.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({ message: "Não autorizado" });
    });

    it("deve capturar Error genérico e retornar 500", async () => {
      const error = new Error("Crash");
      (commentService.deleteComment as jest.Mock).mockRejectedValue(error);

      req = { params: { id: "c1" }, user: { id: "u1" } } as any;

      await commentController.deleteCommentAsPostAuthor(
        req as Request,
        res as Response
      );

      expect(res.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erro ao excluir o comentário da postagem",
      });
    });
  });

  describe("createComment", () => {
    it("deve lançar ApiError(400) se postId não for fornecido", async () => {
      req = { params: {}, body: { content: "teste" } };

      await expect(
        commentController.createComment(req as Request, res as Response)
      ).rejects.toBeInstanceOf(ApiError);

      await expect(
        commentController.createComment(req as Request, res as Response)
      ).rejects.toThrow("Parâmetro postId é obrigatório");
    });

    it("deve criar comentário e retornar 201", async () => {
      const newComment = { id: "c1", content: "teste" };
      (commentService.createComment as jest.Mock).mockResolvedValue(newComment);

      req = {
        params: { postId: "p1" },
        body: { content: "teste" },
      };

      await commentController.createComment(req as Request, res as Response);

      expect(commentService.createComment).toHaveBeenCalledWith("p1", {
        content: "teste",
      });
      expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(newComment);
    });
  });

  describe("getCommentById", () => {
    it("deve retornar 200 com o comentário", async () => {
      const comment = { id: "c1", content: "ok" };
      (commentService.getCommentById as jest.Mock).mockResolvedValue(comment);

      req = { params: { id: "c1" } };

      await commentController.getCommentById(req as Request, res as Response);

      expect(commentService.getCommentById).toHaveBeenCalledWith("c1");
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(comment);
    });
  });

  describe("updateComment", () => {
    it("deve atualizar e retornar 200", async () => {
      const updated = { id: "c1", content: "updated" };
      (commentService.updateComment as jest.Mock).mockResolvedValue(updated);

      req = { params: { id: "c1" }, body: { content: "updated" } };

      await commentController.updateComment(req as Request, res as Response);

      expect(commentService.updateComment).toHaveBeenCalledWith("c1", {
        content: "updated",
      });
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(updated);
    });
  });
});