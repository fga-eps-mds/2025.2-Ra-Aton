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

const DEFAULT_FEED_LIMIT = 10;
const DEFAULT_PAGE = 1;

export const listMatchesSchema = z.object({
  query: z.object({
    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(50)
      .default(DEFAULT_FEED_LIMIT)
      .optional(),

    page: z.coerce.number().int().positive().default(DEFAULT_PAGE).optional(),
  }),
});
