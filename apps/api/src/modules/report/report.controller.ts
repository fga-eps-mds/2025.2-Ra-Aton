import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { reportService } from "./report.service";
import httpStatus from "http-status";
import { CreateReportInput } from "./report.validation";

class ReportController {
  async createReport(req: Request, res: Response): Promise<void> {
    try {
      const id: string | undefined = req.params.id;
      const { reporterId, reason, type }: CreateReportInput["body"] = req.body;

      if (!id || !reporterId || !reason || !type) {
        res.status(httpStatus.BAD_REQUEST).json({
          message: "id, reporterId, reason e type são obrigatórios",
        });
        return;
      }

      const report = await reportService.createReport(
        id,
        reporterId,
        reason,
        type,
      );

      if (!report) {
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error creating report" });
        return;
      }

      res.status(httpStatus.CREATED).json(report);
    } catch (error) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        (error as Error).message,
      );
    }
  }
}

const reportController = new ReportController();
export { reportController };
export default reportController;
