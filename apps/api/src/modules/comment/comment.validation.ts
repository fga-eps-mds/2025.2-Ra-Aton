import z from "zod";

export const deleteCommentSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});
