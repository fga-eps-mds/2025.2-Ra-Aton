import { prismaMock } from "../prisma-mock";
import reportRepository from "../../modules/report/report.repository";

describe("ReportRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createPostReport", () => {
    it("deve criar denúncia para post", async () => {
      const payload = { id: "p1", reporterId: "u1", reason: "motivo" };
      const created = {
        id: "r1",
        postId: "p1",
        reporterId: "u1",
        reason: "motivo",
      };
      prismaMock.report.create.mockResolvedValue(created as any);

      const result = await reportRepository.createPostReport(payload as any);
      expect(result).toEqual(created);
      expect(prismaMock.report.create).toHaveBeenCalledWith({
        data: {
          postId: payload.id,
          reporterId: payload.reporterId,
          reason: payload.reason,
        },
      });
    });
  });

  describe("createCommentReport", () => {
    it("deve criar denúncia para comentário", async () => {
      const payload = { id: "c1", reporterId: "u1", reason: "motivo" };
      const created = {
        id: "r2",
        commentId: "c1",
        reporterId: "u1",
        reason: "motivo",
      };
      prismaMock.report.create.mockResolvedValue(created as any);

      const result = await reportRepository.createCommentReport(payload as any);
      expect(result).toEqual(created);
      expect(prismaMock.report.create).toHaveBeenCalledWith({
        data: {
          commentId: payload.id,
          reporterId: payload.reporterId,
          reason: payload.reason,
        },
      });
    });
  });

  describe("countReportsByPostId", () => {
    it("deve retornar contagem de denúncias por post", async () => {
      prismaMock.report.count.mockResolvedValue(3 as any);
      const result = await reportRepository.countReportsByPostId("p1");
      expect(result).toEqual(3);
      expect(prismaMock.report.count).toHaveBeenCalledWith({
        where: { postId: "p1" },
      });
    });
  });

  describe("countReportsByCommentId", () => {
    it("deve retornar contagem de denúncias por comentário", async () => {
      prismaMock.report.count.mockResolvedValue(2 as any);
      const result = await reportRepository.countReportsByCommentId("c1");
      expect(result).toEqual(2);
      expect(prismaMock.report.count).toHaveBeenCalledWith({
        where: { commentId: "c1" },
      });
    });
  });

  describe("updatePost", () => {
    it("deve atualizar post para conteúdo removido", async () => {
      (prismaMock.post.update as jest.Mock).mockResolvedValue({} as any);
      await reportRepository.updatePost("p1");
      expect(prismaMock.post.update).toHaveBeenCalledWith({
        where: { id: "p1" },
        data: {
          title: "[REMOVIDO PELO SISTEMA]",
          content: "[REMOVIDO PELO SISTEMA]",
        },
      });
    });
  });

  describe("deleteReportByCommentId", () => {
    it("deve deletar denúncias por commentId", async () => {
      (prismaMock.report.deleteMany as jest.Mock).mockResolvedValue(undefined);
      await reportRepository.deleteReportByCommentId("c1");
      expect(prismaMock.report.deleteMany).toHaveBeenCalledWith({
        where: { commentId: "c1" },
      });
    });
  });

  describe("deleteComment", () => {
    it("deve deletar comentário por id via reportRepository", async () => {
      (prismaMock.comment.deleteMany as jest.Mock).mockResolvedValue(undefined);
      await reportRepository.deleteComment("c1");
      expect(prismaMock.comment.deleteMany).toHaveBeenCalledWith({
        where: { id: "c1" },
      });
    });
  });

  describe("deleteReportByPostId", () => {
    it("deve deletar denúncias por postId", async () => {
      (prismaMock.report.deleteMany as jest.Mock).mockResolvedValue(undefined);
      await reportRepository.deleteReportByPostId("p1");
      expect(prismaMock.report.deleteMany).toHaveBeenCalledWith({
        where: { postId: "p1" },
      });
    });
  });
});
