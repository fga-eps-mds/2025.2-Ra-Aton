import { Response, Request } from "express";
import { ApiError } from "../../utils/ApiError";
import { attendanceService } from "./attendance.service";
import httpStatus from "http-status";
import { AttendanceParams } from "./attendance.validation";

class AttendanceController {
  async toggleAttendance(req: Request, res: Response): Promise<void> {
    try {
      const postId: AttendanceParams["params"]["postId"] | undefined =
        req.params.postId;
      const authorId: AttendanceParams["body"]["authorId"] | undefined =
        req.body.authorId;

      if (!postId || !authorId) {
        res
          .status(httpStatus.BAD_REQUEST)
          .json({ message: "postId e authorId são obrigatórios" });
        return;
      }

      const attendance = await attendanceService.toggleAttendance(
        postId,
        authorId,
      );

      res.status(httpStatus.CREATED).json(attendance);
    } catch (error) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        (error as Error).message,
      );
    }
  }
}

const attendanceController = new AttendanceController();
export { attendanceController };
export default attendanceController;
