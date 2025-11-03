import { Request, Response } from "express";
import { postsService } from "../services/postsService";
import HttpStatus from "http-status";
import { ApiError } from "../utils/ApiError";

class PostsController {
  async likePost(req: Request, res: Response) {
    const { postId } = req.params;
    const authUserId = req.user?.id;

    if (!authUserId)
      throw new ApiError(HttpStatus.UNAUTHORIZED, "Não autorizado");
    if (!postId)
      throw new ApiError(HttpStatus.BAD_REQUEST, "postId é obrigatório");

    await postsService.likePost(authUserId, postId);
    return res.status(HttpStatus.NO_CONTENT).send();
  }

  async unlikePost(req: Request, res: Response) {
    const { postId } = req.params;
    const authUserId = req.user?.id;

    if (!authUserId)
      throw new ApiError(HttpStatus.UNAUTHORIZED, "Não autorizado");
    if (!postId)
      throw new ApiError(HttpStatus.BAD_REQUEST, "postId é obrigatório");

    await postsService.unlikePost(authUserId, postId);
    return res.status(HttpStatus.NO_CONTENT).send();
  }

  async attendPost(req: Request, res: Response) {
    const { postId } = req.params;
    const authUserId = req.user?.id;

    if (!authUserId)
      throw new ApiError(HttpStatus.UNAUTHORIZED, "Não autorizado");
    if (!postId)
      throw new ApiError(HttpStatus.BAD_REQUEST, "postId é obrigatório");

    await postsService.attendPost(authUserId, postId);
    return res.status(HttpStatus.NO_CONTENT).send();
  }

  async unattendPost(req: Request, res: Response) {
    const { postId } = req.params;
    const authUserId = req.user?.id;

    if (!authUserId)
      throw new ApiError(HttpStatus.UNAUTHORIZED, "Não autorizado");
    if (!postId)
      throw new ApiError(HttpStatus.BAD_REQUEST, "postId é obrigatório");

    await postsService.unattendPost(authUserId, postId);
    return res.status(HttpStatus.NO_CONTENT).send();
  }

  async addComment(req: Request, res: Response) {
    const { postId } = req.params;
    const { content } = req.body;
    const authUserId = req.user?.id;

    if (!authUserId)
      throw new ApiError(HttpStatus.UNAUTHORIZED, "Não autorizado");
    if (!postId)
      throw new ApiError(HttpStatus.BAD_REQUEST, "postId é obrigatório");

    const comment = await postsService.addComment(authUserId, postId, content);
    return res.status(HttpStatus.CREATED).json(comment);
  }
}

export default new PostsController();
// Controllers for posts (likes, attendance, comments)

// legacy stubs removed
