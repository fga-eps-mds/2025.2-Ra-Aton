import { Router } from "express";
import feedController from "../controllers/feedController";
import { parsePagination } from "../utils/pagination";

const router: Router = Router();

router.get("/", (req, res, next) =>
  feedController.getFeed(req, res, next).catch(next),
);

export default router;
