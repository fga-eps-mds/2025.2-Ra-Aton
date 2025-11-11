import { prisma } from "../../database/prisma.client";
import { Post, Prisma } from "@prisma/client";

export const postRepository = {
  findAll: async (limit: number, offset: number): Promise<{ posts: Post[]; totalCount: number }> => {
    const [posts, totalCount] = await prisma.$transaction([
      prisma.post.findMany({
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.post.count(),
    ]);
    return {
      posts,
      totalCount,
    };
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
