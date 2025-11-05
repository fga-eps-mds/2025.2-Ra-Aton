import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { reportController } from "./report.controller";
import { catchAsync } from "../../utils/catchAsync";
import { createReportSchema } from "./report.validation";
import { auth } from "../../middlewares/auth";

const reportRoutes: Router = Router({ mergeParams: true });

// POST /posts/:id/report
reportRoutes.post(
  "/",
  auth,
  validateRequest(createReportSchema),
  catchAsync(reportController.createReport),
);

export default reportRoutes;

export { reportRoutes };
