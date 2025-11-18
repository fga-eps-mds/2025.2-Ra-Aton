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
    it("deve retornar 400 se limit > 50", async () => {
      req = {
        body: { userId: "1" },
        query: { limit: "100", page: "1" },
      };

      await expect(
        postController.listPosts(req as Request, res as Response),
      ).rejects.toBeInstanceOf(ApiError);

      expect((res.status as jest.Mock).mock.calls.length).toBe(0);
    });

    it("deve retornar 200 com resultado paginado", async () => {
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

    it("deve usar valores padrão quando query inválida", async () => {
      const mockResult = { page: 1, limit: 10, items: [] };
      (postService.listPosts as jest.Mock).mockResolvedValue(mockResult);

      req = { body: { userId: "1" }, query: { limit: "abc", page: "zzz" } };

      await postController.listPosts(req as Request, res as Response);

      expect(postService.listPosts).toHaveBeenCalledWith(10, 1, "1");
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    });
  });

  describe("createPost", () => {
    it("deve chamar service e retornar 201", async () => {
      const payload = { content: "X", title: "Novo" };
      const created = { ...payload, id: "p1"};
      const author = { id: "user123" };
      (postService.createPost as jest.Mock).mockResolvedValue(created);
      (userService.getUserById as jest.Mock).mockResolvedValue({ id: "user123" });
      
      req = { body: payload, user: { id: "user123" } } as any;
      const data = {
        ...req.body,
        author: author,
      };  
      
      await postController.createPost(req as Request, res as Response);

      expect(postService.createPost).toHaveBeenCalledWith(data);
      expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    it("deve propagar erro quando service falhar", async () => {
      const payload = { title: "Novo", content: "X" };
      (postService.createPost as jest.Mock).mockRejectedValue(
        new Error("DB error"),
      );

      req = { body: payload };

      await expect(
        postController.createPost(req as Request, res as Response),
      ).rejects.toThrow(Error);
    });
  });

  describe("getPostById", () => {
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

  describe("updatePost", () => {
    it("deve atualizar e retornar 200", async () => {
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
  });

  describe("deletePost", () => {
    it("deve deletar e retornar 204", async () => {
      (postService.deletePost as jest.Mock).mockResolvedValue(undefined);

      req = { params: { id: "p1" }, user: { id: "user123" } } as any;

      await postController.deletePost(req as Request, res as Response);

      expect(postService.deletePost).toHaveBeenCalledWith("p1", "user123");
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe("listPosts", () => {
    it("deve retornar 400 se limit > 50", async () => {
      req = {
        body: { userId: "1" },
        query: { limit: "100", page: "1" },
      };

      await expect(
        postController.listPosts(req as Request, res as Response),
      ).rejects.toBeInstanceOf(ApiError);

      expect((res.status as jest.Mock).mock.calls.length).toBe(0);
    });

    it("deve retornar 200 com resultado paginado", async () => {
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

    it("deve usar valores padrão quando query inválida", async () => {
      const mockResult = { page: 1, limit: 10, items: [] };
      (postService.listPosts as jest.Mock).mockResolvedValue(mockResult);

      req = { body: { userId: "1" }, query: { limit: "abc", page: "zzz" } };

      await postController.listPosts(req as Request, res as Response);

      expect(postService.listPosts).toHaveBeenCalledWith(10, 1, "1");
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    });
  });

  describe("createPost", () => {
    it("deve chamar service e retornar 201", async () => {
      const payload = { content: "X", title: "Novo" };
      const created = { ...payload, id: "p1"};
      const author = { id: "user123" };
      (postService.createPost as jest.Mock).mockResolvedValue(created);
      (userService.getUserById as jest.Mock).mockResolvedValue({ id: "user123" });
      
      req = { body: payload, user: { id: "user123" } } as any;
      const data = {
        ...req.body,
        author: author,
      };  
      
      await postController.createPost(req as Request, res as Response);

      expect(postService.createPost).toHaveBeenCalledWith(data);
      expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    it("deve propagar erro quando service falhar", async () => {
      const payload = { title: "Novo", content: "X" };
      (postService.createPost as jest.Mock).mockRejectedValue(
        new Error("DB error"),
      );

      req = { body: payload };

      await expect(
        postController.createPost(req as Request, res as Response),
      ).rejects.toThrow(Error);
    });
  });

  describe("getPostById", () => {
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

  describe("updatePost", () => {
    it("deve atualizar e retornar 200", async () => {
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
  });

  describe("deletePost", () => {
    it("deve deletar e retornar 204", async () => {
      (postService.deletePost as jest.Mock).mockResolvedValue(undefined);

      req = { params: { id: "p1" }, user: { id: "user123" } } as any;

      await postController.deletePost(req as Request, res as Response);

      expect(postService.deletePost).toHaveBeenCalledWith("p1", "user123");
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });
  });
});