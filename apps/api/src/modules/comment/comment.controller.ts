import { Request, Response } from "express";
import commentService from "./comment.service";
import httpStatus from "http-status";
import { ApiError } from "../../utils/ApiError";
import type { CreateCommentInput } from "./comment.validation";

class CommentController {
  async listComments(req: Request, res: Response) {
    try {
      const comments = await commentService.listComments();
      if (!comments || comments.length === 0) {
        return res.status(httpStatus.NO_CONTENT).send();
      }
      return res.status(httpStatus.OK).json(comments);
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Erro ao listar comentários",
      });
    }
  }

  async createComment(req: Request, res: Response) {
    const { postId } = req.params;
    if (!postId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Parâmetro postId é obrigatório",
      );
    }
    const commentData: CreateCommentInput["body"] = req.body;
    const newComment = await commentService.createComment(postId, commentData);
    res.status(httpStatus.CREATED).json(newComment);
  }

  async getCommentById(req: Request, res: Response) {
    const commentId: string = req.params.id!;
    const comment = await commentService.getCommentById(commentId);
    res.status(httpStatus.OK).json(comment);
  }

  async deleteComment(req: Request, res: Response) {
    const commentId: string = req.params.id!;
    await commentService.deleteComment(commentId);
    res.status(httpStatus.NO_CONTENT).send();
  }

  async updateComment(req: Request, res: Response) {
    const commentId: string = req.params.id!;
    const updateData = req.body;
    const updatedComment = await commentService.updateComment(
      commentId,
      updateData,
    );
    res.status(httpStatus.OK).json(updatedComment);
  }
}

const commentController = new CommentController();
export { commentController };
export default commentController;
