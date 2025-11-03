import { Router } from "express";
import postsController from "../controllers/postsController";
import { validateComment } from "../validators/comment.validator";

const router: Router = Router();

router.post("/:postId/like", (req, res, next) =>
  postsController.likePost(req, res).catch(next),
);

router.delete("/:postId/like", (req, res, next) =>
  postsController.unlikePost(req, res).catch(next),
);

router.post("/:postId/attendance", (req, res, next) =>
  postsController.attendPost(req, res).catch(next),
);

router.delete("/:postId/attendance", (req, res, next) =>
  postsController.unattendPost(req, res).catch(next),
);

router.post("/:postId/comments", validateComment, (req, res, next) =>
  postsController.addComment(req, res).catch(next),
);

export default router;
