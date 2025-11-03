import { prisma } from "../database/prisma.client";
import { ApiError } from "../utils/ApiError";
import HttpStatus from "http-status";

export const postsService = {
  async likePost(userId: string, postId: string) {
    const existing = await prisma.postLike.findFirst({
      where: { userId, postId },
    });
    if (existing) throw new ApiError(HttpStatus.CONFLICT, "Post já curtido");

    await prisma.$transaction([
      prisma.postLike.create({ data: { userId, postId } }),
      prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      }),
    ]);
  },

  async unlikePost(userId: string, postId: string) {
    const existing = await prisma.postLike.findFirst({
      where: { userId, postId },
    });
    if (!existing)
      throw new ApiError(HttpStatus.NOT_FOUND, "Curtida não encontrada");

    await prisma.$transaction([
      prisma.postLike.delete({ where: { id: existing.id } }),
      prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);
  },

  async attendPost(userId: string, postId: string) {
    const existing = await prisma.attendance.findFirst({
      where: { userId, postId },
    });
    if (existing)
      throw new ApiError(HttpStatus.CONFLICT, "Já confirmou presença");

    await prisma.$transaction([
      prisma.attendance.create({ data: { userId, postId } }),
      prisma.post.update({
        where: { id: postId },
        data: { attendancesCount: { increment: 1 } },
      }),
    ]);
  },

  async unattendPost(userId: string, postId: string) {
    const existing = await prisma.attendance.findFirst({
      where: { userId, postId },
    });
    if (!existing)
      throw new ApiError(HttpStatus.NOT_FOUND, "Presença não encontrada");

    await prisma.$transaction([
      prisma.attendance.delete({ where: { id: existing.id } }),
      prisma.post.update({
        where: { id: postId },
        data: { attendancesCount: { decrement: 1 } },
      }),
    ]);
  },

  async addComment(userId: string, postId: string, content: string) {
    const created = await prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: { authorId: userId, postId, content },
      });
      await tx.post.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } },
      });
      return comment;
    });

    return created;
  },
};
