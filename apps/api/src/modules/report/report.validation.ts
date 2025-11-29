import { z } from "zod";

/**
 * Esquema de validação para os parâmetros e corpo da rota de denúncias de postagens e comentários.
 */

export const createReportSchema = z.object({
  params: z.object({
    id: z.uuid({
      message: "id deve ser um UUID válido",
    }),
  }),
  body: z.object({
    type: z.enum(["post", "comment"], {
      message: "type deve ser 'post' ou 'comment'",
    }),

    reporterId: z.uuid({
      message: "reporterId deve ser um UUID válido",
    }),
    reason: z.string().min(10, {
      message: "O motivo ('reason') deve ter no mínimo 10 caracteres",
    }),
  }),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
