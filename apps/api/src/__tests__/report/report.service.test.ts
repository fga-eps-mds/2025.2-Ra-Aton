import reportService from "../../modules/report/report.service";
import { reportRepository } from "../../modules/report/report.repository";
import { ApiError } from "../../utils/ApiError";

jest.mock("../../modules/report/report.repository");

describe("ReportService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createReport for post", () => {
    it("deve criar denúncia para post", async () => {
      const postId = "p1";
      const reporterId = "u1";
      const reason = "Conteúdo inapropriado";
      const created = { id: "r1", postId, reporterId, reason };

      const repo = jest.mocked(reportRepository);
      repo.createPostReport.mockResolvedValue(created as any);
      repo.countReportsByPostId.mockResolvedValue(1);

      const result = await reportService.createReport(
        postId,
        reporterId,
        reason,
        "post",
      );

      expect(result).toEqual(created);
      expect(repo.createPostReport).toHaveBeenCalledWith({
        id: postId,
        reporterId,
        reason,
      });
      expect(repo.countReportsByPostId).toHaveBeenCalledWith(postId);
    });

    it("deve remover post e denúncias quando atinge 10 denúncias", async () => {
      const postId = "p1";
      const reporterId = "u1";
      const reason = "Conteúdo inapropriado";
      const created = { id: "r1", postId, reporterId, reason };

      const repo = jest.mocked(reportRepository);
      repo.createPostReport.mockResolvedValue(created as any);
      repo.countReportsByPostId.mockResolvedValue(10);
      (repo.updatePost as jest.Mock).mockResolvedValue(undefined);
      (repo.deleteReportByPostId as jest.Mock).mockResolvedValue(undefined);

      const result = await reportService.createReport(
        postId,
        reporterId,
        reason,
        "post",
      );

      expect(result).toEqual(created);
      expect(repo.updatePost).toHaveBeenCalledWith(postId);
      expect(repo.deleteReportByPostId).toHaveBeenCalledWith(postId);
    });
  });

  describe("createReport for comment", () => {
    it("deve criar denúncia para comentário", async () => {
      const commentId = "c1";
      const reporterId = "u1";
      const reason = "Spam";
      const created = { id: "r2", commentId, reporterId, reason };

      const repo = jest.mocked(reportRepository);
      repo.createCommentReport.mockResolvedValue(created as any);
      repo.countReportsByCommentId.mockResolvedValue(1);

      const result = await reportService.createReport(
        commentId,
        reporterId,
        reason,
        "comment",
      );

      expect(result).toEqual(created);
      expect(repo.createCommentReport).toHaveBeenCalledWith({
        id: commentId,
        reporterId,
        reason,
      });
      expect(repo.countReportsByCommentId).toHaveBeenCalledWith(commentId);
    });

    it("deve deletar comentário e denúncias quando atinge 10 denúncias", async () => {
      const commentId = "c1";
      const reporterId = "u1";
      const reason = "Spam";
      const created = { id: "r2", commentId, reporterId, reason };

      const repo = jest.mocked(reportRepository);
      repo.createCommentReport.mockResolvedValue(created as any);
      repo.countReportsByCommentId.mockResolvedValue(10);
      (repo.deleteComment as jest.Mock).mockResolvedValue(undefined);
      (repo.deleteReportByCommentId as jest.Mock).mockResolvedValue(undefined);

      const result = await reportService.createReport(
        commentId,
        reporterId,
        reason,
        "comment",
      );

      expect(result).toEqual(created);
      expect(repo.deleteComment).toHaveBeenCalledWith(commentId);
      expect(repo.deleteReportByCommentId).toHaveBeenCalledWith(commentId);
    });
  });

  describe("createReport error handling", () => {
    it("deve retornar ApiError para tipo inválido", async () => {
      const result = await reportService.createReport(
        "id",
        "u1",
        "reason",
        "invalid" as any,
      );

      expect(result).toBeInstanceOf(ApiError);
    });

    it("deve retornar ApiError em caso de erro geral", async () => {
      const repo = jest.mocked(reportRepository);
      repo.createPostReport.mockRejectedValue(new Error("Database error"));

      const result = await reportService.createReport(
        "p1",
        "u1",
        "reason",
        "post",
      );

      expect(result).toBeInstanceOf(ApiError);
    });
  });
});
