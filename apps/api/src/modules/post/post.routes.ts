import { Router, type Router as RouterType } from "express";
import postController from "./post.controller";
import validateRequest from "../../middlewares/validateRequest";
import { catchAsync } from "../../utils/catchAsync";
import { auth } from "../../middlewares/auth";
import {
  createPostSchema,
  updatePostSchema,
  deletePostSchema,
  deleteCommentSchema,
} from "./post.validation";

const router: RouterType = Router();

// ===================================
// Rotas Públicas (Não exigem token)
// ===================================

router.get("/", catchAsync(postController.listPosts));

router.post(
  "/",
  auth,
  // validateRequest(createPostSchema),
  catchAsync(postController.createPost),
);

// ===================================
// Rotas Protegidas (Exigem token JWT)
// ===================================

router.patch(
  "/:id",
  auth,
  validateRequest(updatePostSchema),
  catchAsync(postController.updatePost),
);

router.delete(
  "/:id",
  auth,
  validateRequest(deletePostSchema),
  catchAsync(postController.deletePost),
);

export default router;
