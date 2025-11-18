import { Response, Request } from "express";
import { ApiError } from "../../utils/ApiError";
import { postLikeService } from "./postlike.service";
import httpStatus from "http-status";
import { PostLikeParams } from "./postlike.validation";

class PostLikeController {
  async togglePostLike(req: Request, res: Response): Promise<void> {
    try {
      const postId: PostLikeParams["params"]["postId"] | undefined =
        req.params.postId;
      const authorId: PostLikeParams["body"]["authorId"] | undefined =
        req.body.authorId;

      if (!postId || !authorId) {
        res
          .status(httpStatus.BAD_REQUEST)
          .json({ message: "postId e authorId são obrigatórios" });
        return;
      }

      const postLike = await postLikeService.togglePostLike(postId, authorId);

      res.status(httpStatus.CREATED).json(postLike);
    } catch (error) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        (error as Error).message,
      );
    }
  }
}

const postLikeController = new PostLikeController();
export { postLikeController };
export default postLikeController;
