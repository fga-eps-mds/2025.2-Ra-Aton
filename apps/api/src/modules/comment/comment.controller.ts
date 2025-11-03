import { Request, Response } from "express";
import { commentService } from "./comment.service";
import { postService } from "../post/post.service";
import { ApiError } from "../../utils/ApiError";
import HttpStatus from "http-status";
import { userService } from "../user/user.service";

class commentController {
  async deleteCommentAsPostAuthor(req: Request, res: Response) {
    const id = req.params.id;
    if (!id) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: "O id é necessesário para excluir os comentários da postagem",
      });
    }

    const authUserId = (req as any).user!.id;

    try {
      await commentService.deleteComment(id, authUserId);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Erro ao excluir o comentário da postagem" });
    }
  }
}

export default new commentController();
