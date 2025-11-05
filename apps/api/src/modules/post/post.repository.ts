import { prisma } from "../../database/prisma.client";
import { Prisma } from "@prisma/client";

export const postRepository = {
  findAll: async () => {
    return await prisma.post.findMany();
  },

  findById: async (id: string) => {
    return await prisma.post.findUnique({
      where: { id },
      include: {
        comments: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                userName: true,
              },
            },
          },
        },
      },
    });
  },

  create: async (data: Prisma.PostCreateInput) => {
    return await prisma.post.create({
      data,
    });
  },

  delete: async (id: string) => {
    return await prisma.post.delete({
      where: { id },
    });
  },

  update: async (id: string, data: Prisma.PostUpdateInput) => {
    return await prisma.post.update({
      where: { id },
      data,
    });
  },
};
