import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import commentController from "./comment.controller";
import { catchAsync } from "../../utils/catchAsync";
import {
  createCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
  commentIdParamSchema,
} from "./comment.validation";
import { auth } from "../../middlewares/auth";

const commentRoutes: Router = Router({ mergeParams: true });

// GET /posts/:postId/comments
commentRoutes.get("/", auth, catchAsync(commentController.listComments));

// POST /posts/:postId/comments
commentRoutes.post(
  "/",
  auth,
  validateRequest(createCommentSchema),
  catchAsync(commentController.createComment),
);

// GET /posts/:postId/comments/:id
commentRoutes.get(
  "/:id",
  auth,
  validateRequest(commentIdParamSchema),
  catchAsync(commentController.getCommentById),
);

// DELETE /posts/:postId/comments/:id
commentRoutes.delete(
  "/:id",
  auth,
  validateRequest(deleteCommentSchema),
  catchAsync(commentController.deleteCommentAsPostAuthor),
);

// PATCH /posts/:postId/comments/:id
commentRoutes.patch(
  "/:id",
  auth,
  validateRequest(updateCommentSchema),
  catchAsync(commentController.updateComment),
);

export default commentRoutes;

export { commentRoutes };
