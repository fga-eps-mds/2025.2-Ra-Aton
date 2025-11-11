import { z } from "zod";

const DEFAULT_FEED_LIMIT = 10;
const PAGE = 1;
const allowedPostType = ["GENERAL", "EVENT"];

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
  body: z.object({
    userId: z.uuid(),
  }),
});

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

export const postIdParamSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});

