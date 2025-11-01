import { Router, type Router as RouterType } from "express";
import commentController from "./comment.controller";
import validateRequest from "../../middlewares/validateRequest";
import { catchAsync } from "../../utils/catchAsync";
import { auth } from "../../middlewares/auth";
import { deleteCommentSchema } from "./comment.validation";

const router: RouterType = Router();

// ===================================
// Rotas Protegidas (Exigem token JWT)
// ===================================

router.delete(
  "/:id",
  auth,
  validateRequest(deleteCommentSchema),
  catchAsync(commentController.deleteCommentAsPostAuthor),
);

export default router;
