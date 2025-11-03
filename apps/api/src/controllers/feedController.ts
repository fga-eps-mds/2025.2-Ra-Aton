import { Request, Response, NextFunction } from "express";
import { feedService } from "../services/feedService";
import HttpStatus from "http-status";

class FeedController {
  async getFeed(req: Request, res: Response, _next: NextFunction) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const authUserId = req.user?.id || null;

    const feed = await feedService.getFeed(authUserId, page, limit);
    return res.status(HttpStatus.OK).json(feed);
  }
}

export default new FeedController();

export async function getFeed(req, res) {
  res.status(501).json({ message: "Not implemented" });
}
