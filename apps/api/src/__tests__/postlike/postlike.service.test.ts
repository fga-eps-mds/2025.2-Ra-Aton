import postLikeService from "../../modules/postLike/postlike.service";
import { postLikeRepository } from "../../modules/postLike/postlike.repository";

jest.mock("../../modules/postLike/postlike.repository");

describe("PostLikeService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("togglePostLike", () => {
    it("deve criar postlike quando não existir", async () => {
      const postId = "p1";
      const userId = "u1";
      const created = { id: "pl1", postId, userId };

      const repo = jest.mocked(postLikeRepository);
      repo.findUnique.mockResolvedValue(null);
      repo.create.mockResolvedValue(created as any);
      (repo.updatePostLikesCount as jest.Mock).mockResolvedValue(undefined);

      const result = await postLikeService.togglePostLike(postId, userId);

      expect(result).toEqual(created);
      expect(repo.findUnique).toHaveBeenCalledWith(postId, userId);
      expect(repo.create).toHaveBeenCalledWith({ data: { postId, userId } });
      expect(repo.updatePostLikesCount).toHaveBeenCalledWith(postId, 1);
    });

    it("deve deletar postlike e decrementar contador quando existir", async () => {
      const postId = "p1";
      const userId = "u1";
      const existing = { id: "pl1", postId, userId };

      const repo = jest.mocked(postLikeRepository);
      repo.findUnique.mockResolvedValue(existing as any);
      repo.delete.mockResolvedValue(existing as any);
      (repo.updatePostLikesCount as jest.Mock).mockResolvedValue(undefined);

      const result = await postLikeService.togglePostLike(postId, userId);

      expect(result).toEqual(existing);
      expect(repo.findUnique).toHaveBeenCalledWith(postId, userId);
      expect(repo.delete).toHaveBeenCalledWith(existing.id);
      expect(repo.updatePostLikesCount).toHaveBeenCalledWith(postId, -1);
    });
  });
});
