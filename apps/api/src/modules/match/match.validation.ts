import { z } from "zod";

export const getMatchSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID da partida inválido")
  }),
});

export const createMatchSchema = z.object({
  body: z.object({
    userId: z.uuid("ID do usuário autor deve ser um UUID válido"),

    title: z.string().min(3, "Título precisa ter no mínimo 3 carcteres"),
    description: z
      .string()
      .min(2, "Descrição precisa ter no mínimo 2 carcteres")
      .optional(),

    teamNameA: z
      .string()
      .min(2, "Nome do time A precisa ter no mínimo 2 caracteres")
      .optional(),
    teamNameB: z
      .string()
      .min(2, "Nome do time B precisa ter no mínimo 2 caracteres")
      .optional(),

    // Adicionar validação de times para criar e atualizar

    maxPlayers: z
      .number()
      .min(2, "Quantidade de jogadores precisa ser maior que 1")
      .optional(),

    MatchDate: z.preprocess(
      (val) => {
        if (typeof val === "string" || typeof val === "number") {
          return new Date(val);
        }
        return val;
      },
      z.date().refine((d) => !isNaN(d.getTime()), {
        message: "Data do evento inválida",
      }),
    ),
    location: z.string().min(1, "Endereço precisa ter no mínimo 1 caractere"),
  }),
});

export const updateMatchSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(2, "Título precisa ter no mínimo 2 carcteres")
      .optional(),
    description: z
      .string()
      .min(2, "Descrição precisa ter no mínimo 2 carcteres")
      .optional(),

    teamNameA: z
      .string()
      .min(2, "Nome do time A precisa ter no mínimo 2 caracteres")
      .optional(),
    teamNameB: z
      .string()
      .min(2, "Nome do time B precisa ter no mínimo 2 caracteres")
      .optional(),
    // Adicionar validação de times para criar e atualizar

    MatchDate: z
      .preprocess(
        (val) => {
          if (typeof val === "string" || typeof val === "number") {
            return new Date(val);
          }
          return val;
        },
        z.date().refine((d) => !isNaN(d.getTime()), {
          message: "Data do evento inválida",
        }),
      )
      .optional(),
    location: z
      .string()
      .min(1, "Endereço precisa ter no mínimo 1 caractere")
      .optional(),
  }),
});

export const deleteMatchSchema = z.object({
  params: z.object({
    id: z.uuid(),
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

    page: z.coerce.number().int().positive().default(DEFAULT_PAGE).optional()
  }),
});
