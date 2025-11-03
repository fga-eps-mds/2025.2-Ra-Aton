import { z } from "zod";

export const getMatchSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});

export const createMatchSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Título precisa ter no mínimo 3 carcteres"),
    content: z
      .string()
      .min(2, "Descrição precisa ter no mínimo 2 carcteres")
      .optional(),

    // Adicionar validação de times para criar e atualizar

    eventDate: z.preprocess(
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
    eventFinishDate: z.preprocess(
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
    content: z
      .string()
      .min(2, "Descrição precisa ter no mínimo 2 carcteres")
      .optional(),

    // Adicionar validação de times para criar e atualizar

    eventDate: z
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
    eventFinishDate: z
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
