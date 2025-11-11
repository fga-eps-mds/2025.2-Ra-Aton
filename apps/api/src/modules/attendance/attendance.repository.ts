import { prisma } from "../../database/prisma.client";
import { Prisma, Attendance, Post } from "@prisma/client";

export const attendanceRepository = {
  create: async (data: Prisma.AttendanceCreateArgs): Promise<Attendance> => {
    return await prisma.attendance.create({ ...data });
  },
  findUnique: async (
    postId: string,
    userId: string,
  ): Promise<Attendance | null> => {
    const attendance = await prisma.attendance.findFirst({
      where: {
        postId: postId,
        userId: userId,
      },
    });
    if (attendance) {
      return attendance;
    }
    return null;
  },
  delete: async (id: string): Promise<Attendance> => {
    return await prisma.attendance.delete({
      where: { id: id },
    });
  },
  updatePostAttendanceCount: async (
    postId: string,
    incrementBy: number,
  ): Promise<void> => {
    await prisma.post.update({
      where: { id: postId },
      data: {
        attendancesCount: {
          increment: incrementBy,
        },
      },
    });
  },
};
