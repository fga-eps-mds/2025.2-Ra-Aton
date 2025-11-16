import { prismaMock } from "../prisma-mock";
import { commentRepository } from "../../modules/comment/comment.repository";

describe("CommentRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("deve retornar todos os comentários", async () => {
      const mockComments = [
        { id: "c1", content: "c1", postId: "p1", authorId: "u1" },
      ];
      prismaMock.comment.findMany.mockResolvedValue(mockComments as any);

      const result = await commentRepository.findAll();
      expect(result).toEqual(mockComments);
      expect(prismaMock.comment.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("findByPostId", () => {
    it("deve retornar comentários do post", async () => {
      const postId = "p1";
      const mockComments = [{ id: "c1", postId }];
      prismaMock.comment.findMany.mockResolvedValue(mockComments as any);

      const result = await commentRepository.findByPostId(postId);
      expect(result).toEqual(mockComments);
      expect(prismaMock.comment.findMany).toHaveBeenCalledWith({
        where: { postId },
      });
    });
  });

  describe("findById", () => {
    it("deve retornar comentário por id", async () => {
      const mockComment = { id: "c1", content: "hey" };
      prismaMock.comment.findUnique.mockResolvedValue(mockComment as any);

      const result = await commentRepository.findById("c1");
      expect(result).toEqual(mockComment);
      expect(prismaMock.comment.findUnique).toHaveBeenCalledWith({
        where: { id: "c1" },
      });
    });
  });

  describe("create", () => {
    it("deve incrementar contador do post e criar comentário", async () => {
      const createData = { id: "c1", postId: "p1", content: "ok" } as any;
      const created = { ...createData };

      (prismaMock.post.update as jest.Mock).mockResolvedValue({} as any);
      prismaMock.comment.create.mockResolvedValue(created as any);

      const result = await commentRepository.create(createData);
      expect(result).toEqual(created);
      expect(prismaMock.post.update).toHaveBeenCalledWith({
        where: { id: createData.postId },
        data: { commentsCount: { increment: 1 } },
      });
      expect(prismaMock.comment.create).toHaveBeenCalledWith({
        data: createData,
      });
    });
  });

  describe("delete", () => {
    it("deve deletar comentário pelo id", async () => {
      const mockComment = { id: "c1" };
      (prismaMock.comment.delete as jest.Mock).mockResolvedValue(
        mockComment as any,
      );

      await commentRepository.delete("c1");
      expect(prismaMock.comment.delete).toHaveBeenCalledWith({
        where: { id: "c1" },
      });
    });
  });

  describe("update", () => {
    it("deve atualizar comentário e retornar objeto atualizado", async () => {
      const updatePayload = { content: "novo" };
      const updated = { id: "c1", ...updatePayload };
      prismaMock.comment.update.mockResolvedValue(updated as any);

      const result = await commentRepository.update("c1", updatePayload as any);
      expect(result).toEqual(updated);
      expect(prismaMock.comment.update).toHaveBeenCalledWith({
        where: { id: "c1" },
        data: updatePayload,
      });
    });
  });
});
