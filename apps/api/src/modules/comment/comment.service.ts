import { commentRepository } from "./comment.repository";
import { postRepository } from "../post/post.repository";
import { ApiError } from "../../utils/ApiError";
import HttpStatus from "http-status";
export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
}

export const CommentService = {
  listComments: async (): Promise<Comment[]> => {
    return await commentRepository.findAll();
  },

  createComment: async (postId: string, data: any): Promise<Comment> => {
    return await commentRepository.create({ ...data, postId });
  },

  getCommentById: async (id: string): Promise<Comment | null> => {
    return await commentRepository.findById(id);
  },

  deleteComment: async (id: string, authUserId: string): Promise<void> => {
    const commentFound = await commentRepository.findById(id);
    if (!commentFound) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Comentário não encontrada");
    }

    const postFound = await postRepository.findById(commentFound.postId);
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

    await commentRepository.delete(commentFound.id);
  },

  updateComment: async (id: string, data: any): Promise<Comment | null> => {
    return await commentRepository.update(id, data);
  },
};

export default CommentService;
