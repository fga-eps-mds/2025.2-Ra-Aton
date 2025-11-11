import { z } from "zod";

export const PostLikeParamsSchema = z.object({
  params: z.object({
    postId: z.uuid(),
  }),
  body: z.object({
    authorId: z.uuid(),
  }),
});

export type PostLikeParams = z.infer<typeof PostLikeParamsSchema>;
