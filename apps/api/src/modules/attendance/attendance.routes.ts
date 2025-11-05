import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { attendanceController } from "./attendance.controller";
import { catchAsync } from "../../utils/catchAsync";
import { attendanceSchema } from "./attendance.validation";
import { auth } from "../../middlewares/auth";

const attendanceRoutes: Router = Router({ mergeParams: true });

// POST /posts/:postId/attendance
attendanceRoutes.post(
  "/",
  auth,
  validateRequest(attendanceSchema),
  catchAsync(attendanceController.toggleAttendance),
);

export default attendanceRoutes;

export { attendanceRoutes };
