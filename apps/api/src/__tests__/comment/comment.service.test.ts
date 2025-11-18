import CommentService from "../../modules/comment/comment.service";
import { commentRepository } from "../../modules/comment/comment.repository";
import { postRepository } from "../../modules/post/post.repository";
import { ApiError } from "../../utils/ApiError";
import HttpStatus from "http-status";

jest.mock("../../modules/comment/comment.repository");
jest.mock("../../modules/post/post.repository");

describe("CommentService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listComments", () => {
    it("deve retornar lista de comentários", async () => {
      const mockComments = [
        { id: "c1", content: "comment 1", postId: "p1", authorId: "u1" },
        { id: "c2", content: "comment 2", postId: "p1", authorId: "u2" },
      ];

      const repo = jest.mocked(commentRepository);
      repo.findAll.mockResolvedValue(mockComments as any);

      const result = await CommentService.listComments();

      expect(result).toEqual(mockComments);
      expect(repo.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("createComment", () => {
    it("deve criar comentário com postId", async () => {
      const postId = "p1";
      const data = { content: "novo comentário", authorId: "u1" };
      const created = { id: "c1", ...data, postId };

      const repo = jest.mocked(commentRepository);
      repo.create.mockResolvedValue(created as any);

      const result = await CommentService.createComment(postId, data);

      expect(result).toEqual(created);
      expect(repo.create).toHaveBeenCalledWith({ ...data, postId });
    });
  });

  describe("getCommentById", () => {
    it("deve retornar comentário por id", async () => {
      const mockComment = {
        id: "c1",
        content: "ok",
        postId: "p1",
        authorId: "u1",
      };
      const repo = jest.mocked(commentRepository);
      repo.findById.mockResolvedValue(mockComment as any);

      const result = await CommentService.getCommentById("c1");

      expect(result).toEqual(mockComment);
      expect(repo.findById).toHaveBeenCalledWith("c1");
    });

    it("deve retornar null se comentário não existir", async () => {
      const repo = jest.mocked(commentRepository);
      repo.findById.mockResolvedValue(null);

      const result = await CommentService.getCommentById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("deleteComment", () => {
    it("deve deletar comentário se autorizado", async () => {
      const commentId = "c1";
      const authUserId = "u1";
      const postId = "p1";
      const mockComment = { id: commentId, postId, authorId: "u1" };
      const mockPost = { id: postId, authorId: authUserId };

      const commentRepo = jest.mocked(commentRepository);
      const postRepo = jest.mocked(postRepository);

      commentRepo.findById.mockResolvedValue(mockComment as any);
      postRepo.findById.mockResolvedValue(mockPost as any);
      commentRepo.delete.mockResolvedValue(undefined as any);

      await CommentService.deleteComment(commentId, authUserId);

      expect(commentRepo.findById).toHaveBeenCalledWith(commentId);
      expect(postRepo.findById).toHaveBeenCalledWith(postId);
      expect(commentRepo.delete).toHaveBeenCalledWith(commentId);
    });

    it("deve lançar erro se comentário não existir", async () => {
      const commentRepo = jest.mocked(commentRepository);
      commentRepo.findById.mockResolvedValue(null);

      await expect(
        CommentService.deleteComment("non-existent", "u1"),
      ).rejects.toThrow(
        new ApiError(HttpStatus.NOT_FOUND, "Comentário não encontrada"),
      );
    });

    it("deve lançar erro se post não existir", async () => {
      const commentId = "c1";
      const mockComment = { id: commentId, postId: "p1" };

      const commentRepo = jest.mocked(commentRepository);
      const postRepo = jest.mocked(postRepository);

      commentRepo.findById.mockResolvedValue(mockComment as any);
      postRepo.findById.mockResolvedValue(null);

      await expect(
        CommentService.deleteComment(commentId, "u1"),
      ).rejects.toThrow(
        new ApiError(
          HttpStatus.NOT_FOUND,
          "Postagem relcionada não encontrada",
        ),
      );
    });

    it("deve lançar erro se usuário não é o autor do post", async () => {
      const commentId = "c1";
      const authUserId = "u99";
      const mockComment = { id: commentId, postId: "p1" };
      const mockPost = { id: "p1", authorId: "u1" };

      const commentRepo = jest.mocked(commentRepository);
      const postRepo = jest.mocked(postRepository);

      commentRepo.findById.mockResolvedValue(mockComment as any);
      postRepo.findById.mockResolvedValue(mockPost as any);

      await expect(
        CommentService.deleteComment(commentId, authUserId),
      ).rejects.toThrow(
        new ApiError(
          HttpStatus.FORBIDDEN,
          "Você não tem permissão para excluir os comentários desta postagem",
        ),
      );
    });
  });

  describe("updateComment", () => {
    it("deve atualizar comentário", async () => {
      const commentId = "c1";
      const updateData = { content: "atualizado" };
      const updated = { id: commentId, ...updateData };

      const repo = jest.mocked(commentRepository);
      repo.update.mockResolvedValue(updated as any);

      const result = await CommentService.updateComment(commentId, updateData);

      expect(result).toEqual(updated);
      expect(repo.update).toHaveBeenCalledWith(commentId, updateData);
    });
  });
});
