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
    it("deve retornar 204 quando não houver comentários", async () => {
      (commentService.listComments as jest.Mock).mockResolvedValue([]);

      req = {};

      await commentController.listComments(req as Request, res as Response);

      expect(commentService.listComments).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });

    it("deve retornar 200 com comentários", async () => {
      const items = [{ id: "c1", content: "x", postId: "p1", authorId: "u1" }];
      (commentService.listComments as jest.Mock).mockResolvedValue(items);

      req = {};

      await commentController.listComments(req as Request, res as Response);

      expect(commentService.listComments).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(items);
    });

    it("deve tratar ApiError retornando o status do erro", async () => {
      (commentService.listComments as jest.Mock).mockRejectedValue(
        new ApiError(418, "Erro custom"),
      );

      req = {};

      await commentController.listComments(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(418);
      expect(res.json).toHaveBeenCalledWith({ message: "Erro custom" });
    });
  });

  describe("createComment", () => {
    it("deve lançar ApiError se postId ausente", async () => {
      req = { params: {}, body: { content: "x" } };

      await expect(
        commentController.createComment(req as Request, res as Response),
      ).rejects.toBeInstanceOf(ApiError);
    });

    it("deve criar comentário e retornar 201", async () => {
      const payload = { content: "novo", authorId: "u1" };
      const created = { id: "c1", postId: "p1", ...payload };
      (commentService.createComment as jest.Mock).mockResolvedValue(created);

      req = { params: { postId: "p1" }, body: payload };

      await commentController.createComment(req as Request, res as Response);

      expect(commentService.createComment).toHaveBeenCalledWith("p1", payload);
      expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(created);
    });
  });

  describe("getCommentById", () => {
    it("deve retornar 200 com o comentário", async () => {
      const comment = { id: "c1", content: "x", postId: "p1", authorId: "u1" };
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

  describe("deleteComment", () => {
    it("deve deletar e retornar 204", async () => {
      (commentService.deleteComment as jest.Mock).mockResolvedValue(undefined);

      req = { params: { id: "c1" }, user: { id: "u1" } } as any;

      await commentController.deleteCommentAsPostAuthor(req as Request, res as Response);

      expect(commentService.deleteComment).toHaveBeenCalledWith("c1", "u1");
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
