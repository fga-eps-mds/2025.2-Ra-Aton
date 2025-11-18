import { z } from "zod";

/**
 * Schema para Criação de Comentário (POST /posts/:postId/comments)
 */

export const createCommentSchema = z.object({
  params: z.object({
    postId: z.uuid(),
  }),
  body: z.object({
    authorId: z.uuid(),
    content: z.string().min(2).max(1000),
  }),
});

export const updateCommentSchema = z
  .object({
    params: z.object({
      authorId: z.uuid(),
      postId: z.uuid(),
      commentId: z.uuid(),
    }),
    body: z.object({
      content: z.string().min(10).max(1000).optional(),
    }),
  })
  .refine(
    (data) => {
      return data.body.content !== undefined;
    },
    {
      message: "O campo 'content' deve ser fornecido para atualização.",
      path: ["body"],
    },
  );

export const commentIdParamSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});

export const deleteCommentSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;
export type CommentIdParamInput = z.infer<typeof commentIdParamSchema>;
