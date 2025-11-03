import { Router } from "express";
import reportsController from "../controllers/reportsController";
import { validateReport } from "../validators/report.validator";

const router: Router = Router();

router.post("/", validateReport, (req, res, next) =>
  reportsController.createReport(req, res).catch(next),
);

export default router;
