import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { postLikeController } from "./postlike.controller";
import { catchAsync } from "../../utils/catchAsync";
import { PostLikeParamsSchema } from "./postlike.validation";
import { auth } from "../../middlewares/auth";

const postLikeRoutes: Router = Router({ mergeParams: true });

// POST /posts/:postId/like
postLikeRoutes.post(
  "/",
  auth,
  validateRequest(PostLikeParamsSchema),
  catchAsync(postLikeController.togglePostLike),
);

export default postLikeRoutes;

export { postLikeRoutes };
