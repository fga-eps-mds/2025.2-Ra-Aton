import { Request, Response } from "express";
import httpStatus from "http-status";
import { postLikeController } from "../../modules/postLike/postlike.controller";
import { postLikeService } from "../../modules/postLike/postlike.service";
import { ApiError } from "../../utils/ApiError";

// Mock do service
jest.mock("../../modules/postLike/postlike.service");

describe("PostLikeController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();

    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe("togglePostLike", () => {
    it("deve retornar 400 se postId ou authorId não forem fornecidos", async () => {
      req = {
        params: {},
        body: {},
      };

      await postLikeController.togglePostLike(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "postId e authorId são obrigatórios",
      });
    });

    it("deve criar um like e retornar 201", async () => {
      req = {
        params: { postId: "123" },
        body: { authorId: "456" },
      };

      const mockPostLike = {
        id: "1",
        postId: "123",
        authorId: "456",
      };

      (postLikeService.togglePostLike as jest.Mock).mockResolvedValue(
        mockPostLike,
      );

      await postLikeController.togglePostLike(req as Request, res as Response);

      expect(postLikeService.togglePostLike).toHaveBeenCalledWith("123", "456");
      expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(mockPostLike);
    });

    it("deve lançar ApiError com status 500 se o service falhar", async () => {
      req = {
        params: { postId: "123" },
        body: { authorId: "456" },
      };

      (postLikeService.togglePostLike as jest.Mock).mockRejectedValue(
        new Error("Erro no banco"),
      );

      await expect(
        postLikeController.togglePostLike(req as Request, res as Response),
      ).rejects.toThrow(ApiError);

      await expect(
        postLikeController.togglePostLike(req as Request, res as Response),
      ).rejects.toMatchObject({
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });
});
