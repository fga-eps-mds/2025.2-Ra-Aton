import { prisma } from "../../database/prisma.client";
import { Prisma, PostLike } from "@prisma/client";

export const postLikeRepository = {
  create: async (data: Prisma.PostLikeCreateArgs): Promise<PostLike> => {
    return await prisma.postLike.create({ ...data });
  },
  findUnique: async (
    postId: string,
    userId: string,
  ): Promise<PostLike | null> => {
    const postLike = await prisma.postLike.findFirst({
      where: {
        postId: postId,
        userId: userId,
      },
    });
    if (postLike) {
      return postLike;
    }
    return null;
  },
  delete: async (id: string): Promise<PostLike> => {
    return await prisma.postLike.delete({
      where: { id: id },
    });
  },
  updatePostLikesCount: async (
    postId: string,
    incrementBy: number,
  ): Promise<void> => {
    await prisma.post.update({
      where: { id: postId },
      data: {
        likesCount: {
          increment: incrementBy,
        },
      },
    });
  },
};
