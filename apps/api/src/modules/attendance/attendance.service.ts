import { attendanceRepository as AttendanceRepository } from "./attendance.repository";
import { Attendance } from "@prisma/client";

export const attendanceService = {
  async toggleAttendance(postId: string, userId: string): Promise<Attendance> {
    const existingAttendance = await AttendanceRepository.findUnique(
      postId,
      userId,
    );

    if (existingAttendance) {
      await AttendanceRepository.delete(existingAttendance.id);
      // Update on Post.attendanceCount -1
      await AttendanceRepository.updatePostAttendanceCount(postId, -1);
      return existingAttendance;
    }

    const attendance = await AttendanceRepository.create({
      data: { postId, userId },
    });
    // Update on Post.attendanceCount +1
    await AttendanceRepository.updatePostAttendanceCount(postId, 1);

    return attendance;
  },
};

export default attendanceService;
