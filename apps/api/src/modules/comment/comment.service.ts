import { commentRepository } from "./comment.repository";

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

  deleteComment: async (id: string): Promise<void> => {
    await commentRepository.delete(id);
  },

  updateComment: async (id: string, data: any): Promise<Comment | null> => {
    return await commentRepository.update(id, data);
  },
};

export default CommentService;
