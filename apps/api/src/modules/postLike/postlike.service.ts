import { postLikeRepository } from "./postlike.repository";
import { PostLike } from "@prisma/client";

export const postLikeService = {
  async togglePostLike(postId: string, userId: string): Promise<PostLike> {
    const existingPostLike = await postLikeRepository.findUnique(
      postId,
      userId,
    );

    if (existingPostLike) {
      await postLikeRepository.delete(existingPostLike.id);
      // Update on Post.likesCount -1
      await postLikeRepository.updatePostLikesCount(postId, -1);
      return existingPostLike;
    }

    const postLike = await postLikeRepository.create({
      data: { postId, userId },
    });
    // Update on Post.likesCount +1
    await postLikeRepository.updatePostLikesCount(postId, 1);

    return postLike;
  },
};

export default postLikeService;
