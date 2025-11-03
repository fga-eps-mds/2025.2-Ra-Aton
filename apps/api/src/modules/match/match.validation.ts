import { z } from "zod";

export const getMatchSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID da partida inválido"),
  }),
});

export const manageSubscriptionSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID da partida inválido"),
  }),
});
