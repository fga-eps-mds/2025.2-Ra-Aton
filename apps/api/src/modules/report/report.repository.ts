import { prisma } from "../../database/prisma.client";
import { Report } from "@prisma/client";

export const reportRepository = {
  async createPostReport(data: {
    id: string;
    reporterId: string;
    reason: string;
  }): Promise<Report> {
    return prisma.report.create({
      data: {
        postId: data.id,
        reporterId: data.reporterId,
        reason: data.reason,
      },
    });
  },

  async createCommentReport(data: {
    id: string;
    reporterId: string;
    reason: string;
  }): Promise<Report> {
    return prisma.report.create({
      data: {
        commentId: data.id,
        reporterId: data.reporterId,
        reason: data.reason,
      },
    });
  },

  async countReportsByPostId(postId: string): Promise<number> {
    return prisma.report.count({
      where: {
        postId,
      },
    });
  },

  async countReportsByCommentId(commentId: string): Promise<number> {
    return prisma.report.count({
      where: {
        commentId,
      },
    });
  },

  async updatePost(postId: string): Promise<void> {
    await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        title: "[REMOVIDO PELO SISTEMA]",
        content: "[REMOVIDO PELO SISTEMA]",
      },
    });
  },

  async deleteReportByCommentId(commentId: string): Promise<void> {
    await prisma.report.deleteMany({
      where: {
        commentId,
      },
    });
  },

  async deleteComment(commentId: string): Promise<void> {
    await prisma.comment.deleteMany({
      where: {
        id: commentId,
      },
    });
  },

  async deleteReportByPostId(postId: string): Promise<void> {
    await prisma.report.deleteMany({
      where: {
        postId,
      },
    });
  },
};

export default reportRepository;
