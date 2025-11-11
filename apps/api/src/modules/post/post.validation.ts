import { z } from "zod";

const DEFAULT_FEED_LIMIT = 10;
const PAGE = 1;

export const listPostsSchema = z.object({
  query: z.object({
    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(50)
      .default(DEFAULT_FEED_LIMIT)
      .optional(),
    page: z.coerce.number().int().positive().default(PAGE).optional(),
  }),
});

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(100),
    content: z.string().min(10).max(1000),
    authorId: z.uuid(),
  }),
});

export const updatePostSchema = z
  .object({
    params: z.object({
      id: z.uuid(),
    }),
    body: z.object({
      title: z.string().min(2).max(100).optional(),
      content: z.string().min(10).max(1000).optional(),
    }),
  })
  .refine(
    (data) => {
      return data.body.title !== undefined || data.body.content !== undefined;
    },
    {
      message:
        "Pelo menos um dos campos 'title' ou 'content' deve ser fornecido para atualização.",
      path: ["body"],
    },
  );

export const deletePostSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});

export const postIdParamSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});
