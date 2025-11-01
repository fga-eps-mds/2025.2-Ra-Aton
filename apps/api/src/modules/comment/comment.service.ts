import commentRepository from "./comment.repository";
import postRepository from "../post/post.repository";
import { ApiError } from "../../utils/ApiError";
import HttpStatus from "http-status";

export const commentService = {
  deleteComment: async (id: string, authUserId: string): Promise<void> => {
    const commentFound = await commentRepository.findCommentById(id);
    if (!commentFound) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Comentário não encontrada");
    }

    const postFound = await postRepository.findPostById(commentFound.postId);
    if (!postFound) {
      throw new ApiError(
        HttpStatus.NOT_FOUND,
        "Postagem relcionada não encontrada",
      );
    }

    if (postFound.authorId !== authUserId) {
      throw new ApiError(
        HttpStatus.FORBIDDEN,
        "Você não tem permissão para excluir os comentários desta postagem",
      );
    }

    await commentRepository.deleteComment(commentFound.id);
  },
};
