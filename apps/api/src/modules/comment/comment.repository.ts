import { prisma } from "../../database/prisma.client";
import { Prisma } from "@prisma/client";

export const commentRepository = {
  findAll: async () => {
    return await prisma.comment.findMany();
  },

  findByPostId: async (postId: string) => {
    return await prisma.comment.findMany({
      where: { postId },
    });
  },

  findById: async (id: string) => {
    return await prisma.comment.findUnique({
      where: { id },
    });
  },

  create: async (data: any) => {
    await prisma.post.update({
      // Incrementa o contador de comentários no post relacionado
      where: { id: data.postId },
      data: {
        commentsCount: {
          increment: 1,
        },
      },
    });
    return await prisma.comment.create({
      data,
    });
  },

  delete: async (id: string) => {
    return await prisma.comment.delete({
      where: { id },
    });
  },

  update: async (id: string, data: Prisma.CommentUpdateInput) => {
    return await prisma.comment.update({
      where: { id },
      data,
    });
  },
};
