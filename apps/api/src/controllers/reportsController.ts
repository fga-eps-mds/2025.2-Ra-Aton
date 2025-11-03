import { Request, Response } from "express";
import { reportsService } from "../services/reportsService";
import HttpStatus from "http-status";
import { ApiError } from "../utils/ApiError";

class ReportsController {
  async createReport(req: Request, res: Response) {
    const authUserId = req.user?.id;
    if (!authUserId)
      throw new ApiError(HttpStatus.UNAUTHORIZED, "Não autorizado");

    const { postId, commentId, reason } = req.body;
    const report = await reportsService.createReport(authUserId, {
      postId,
      commentId,
      reason,
    });
    return res.status(HttpStatus.CREATED).json(report);
  }
}

export default new ReportsController();

