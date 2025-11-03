import { prisma } from "../database/prisma.client";
import { ApiError } from "../utils/ApiError";
import HttpStatus from "http-status";

type CreateReportInput = {
  postId?: string;
  commentId?: string;
  reason: string;
};

export const reportsService = {
  async createReport(reporterId: string, input: CreateReportInput) {
    const { postId, commentId, reason } = input;

    if (!postId && !commentId)
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "postId ou commentId é obrigatório",
      );

    const data: Record<string, unknown> = { reporterId, reason };
    if (postId) data.postId = postId;
    if (commentId) data.commentId = commentId;

    const created = await prisma.report.create({ data });
    return created;
  },
};
