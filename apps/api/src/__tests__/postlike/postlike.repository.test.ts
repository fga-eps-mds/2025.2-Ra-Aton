import { prismaMock } from "../prisma-mock";
import { postLikeRepository } from "../../modules/postLike/postlike.repository";

describe("PostLikeRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("deve criar postLike", async () => {
      const createData = {
        data: { id: "pl1", postId: "p1", userId: "u1" },
      } as any;
      const created = { id: "pl1", postId: "p1", userId: "u1" };
      prismaMock.postLike.create.mockResolvedValue(created as any);

      const result = await postLikeRepository.create(createData);
      expect(result).toEqual(created);
      expect(prismaMock.postLike.create).toHaveBeenCalledWith({
        ...createData,
      });
    });
  });

  describe("findUnique", () => {
    it("deve retornar postLike quando existir", async () => {
      const mock = { id: "pl1", postId: "p1", userId: "u1" };
      prismaMock.postLike.findFirst.mockResolvedValue(mock as any);

      const result = await postLikeRepository.findUnique("p1", "u1");
      expect(result).toEqual(mock);
      expect(prismaMock.postLike.findFirst).toHaveBeenCalledWith({
        where: { postId: "p1", userId: "u1" },
      });
    });

    it("deve retornar null quando não existir", async () => {
      prismaMock.postLike.findFirst.mockResolvedValue(null);
      const result = await postLikeRepository.findUnique("p1", "u1");
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("deve deletar postLike por id", async () => {
      const deleted = { id: "pl1" };
      (prismaMock.postLike.delete as jest.Mock).mockResolvedValue(
        deleted as any,
      );

      await postLikeRepository.delete("pl1");
      expect(prismaMock.postLike.delete).toHaveBeenCalledWith({
        where: { id: "pl1" },
      });
    });
  });

  describe("updatePostLikesCount", () => {
    it("deve incrementar contador de likes no post", async () => {
      (prismaMock.post.update as jest.Mock).mockResolvedValue({} as any);

      await postLikeRepository.updatePostLikesCount("p1", 1);
      expect(prismaMock.post.update).toHaveBeenCalledWith({
        where: { id: "p1" },
        data: { likesCount: { increment: 1 } },
      });
    });
  });
});
