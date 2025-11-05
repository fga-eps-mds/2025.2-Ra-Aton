import { z } from "zod";

export const attendanceSchema = z.object({
  params: z.object({
    postId: z.uuid(),
  }),
  body: z.object({
    authorId: z.uuid(),
  }),
});

export type AttendanceParams = z.infer<typeof attendanceSchema>;
