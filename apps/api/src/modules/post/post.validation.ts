import { z } from "zod";

const allowedPostType = ["GENERAL", "EVENT"];

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(2, "Título precisa ter no mínimo 2 carcteres"),
    type: z
      .string()
      .transform((val) => val.toUpperCase())
      .refine((val) => allowedPostType.includes(val as any), {
        message: "Tipo de postagem inválido",
      }),
    content: z
      .string()
      .min(2, "Descrição precisa ter no mínimo 2 carcteres")
      .optional(),
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
    location: z.string().min(1, "Endereço precisa ter no mínimo 1 caractere")
      .optional(),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(2, "Título precisa ter no mínimo 2 carcteres")
      .optional(),
    type: z
      .string()
      .transform((val) => val.toUpperCase())
      .refine((val) => allowedPostType.includes(val as any), {
        message: "Tipo de postagem inválido",
      })
      .optional(),
    content: z
      .string()
      .min(2, "Descrição precisa ter no mínimo 2 carcteres")
      .optional(),
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

export const deletePostSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});
