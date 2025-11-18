import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import postController from "./post.controller";
import { catchAsync } from "../../utils/catchAsync";
import {
  createPostSchema,
  updatePostSchema,
  deletePostSchema,
  postIdParamSchema,
  listPostsSchema,
} from "./post.validation";
import { auth } from "../../middlewares/auth";

const router: Router = Router();

router.get("/", auth,
  validateRequest(listPostsSchema),
  catchAsync(postController.listPosts));

router.post(
  "/",
  auth,
  validateRequest(createPostSchema),
  catchAsync(postController.createPost),
);

router.get(
  "/:id",
  auth,
  validateRequest(postIdParamSchema),
  catchAsync(postController.getPostById),
);

router.delete(
  "/:id",
  auth,
  validateRequest(deletePostSchema),
  catchAsync(postController.deletePost),
);

router.patch(
  "/:id",
  auth,
  validateRequest(updatePostSchema),
  catchAsync(postController.updatePost),
);

export default router;

export const postRoutes: Router = router;
