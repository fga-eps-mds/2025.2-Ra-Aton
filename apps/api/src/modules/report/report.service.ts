import { Prisma } from "@prisma/client";
import { reportRepository } from "./report.repository";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

export const reportService = {
  async createReport(
    id: string,
    reporterId: string,
    reason: string,
    type: "post" | "comment",
  ): Promise<Prisma.ReportCreateArgs["data"] | null | ApiError> {
    try {
      if (type === "post") {
        const report = await reportRepository.createPostReport({
          id,
          reporterId,
          reason,
        });
        const countPostReports =
          await reportRepository.countReportsByPostId(id);

        if (countPostReports >= 10) {
          // Aqui vai a lógica para gestão de posts com muitas denúncias
          await reportRepository.updatePost(id);
          await reportRepository.deleteReportByPostId(id);
        }

        return report;
      } else if (type === "comment") {
        const report = await reportRepository.createCommentReport({
          id,
          reporterId,
          reason,
        });
        const countCommentReports =
          await reportRepository.countReportsByCommentId(id);

        if (countCommentReports >= 10) {
          // Aqui vai a lógica para gestão de comentários com muitas denúncias
          await reportRepository.deleteComment(id);
          await reportRepository.deleteReportByCommentId(id);
        }

        return report;
      }
      return new ApiError(httpStatus.BAD_REQUEST, "Invalid report type");
    } catch (error) {
      console.error("Error creating report:", error);
      return new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Internal server error",
      );
    }
  },
};

export default reportService;
