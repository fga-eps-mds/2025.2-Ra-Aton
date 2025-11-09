import { VerificationStatus } from "@prisma/client";
import { z } from "zod";

export const getGroupSchema = z.object({
  params: z.object({
    name: z.string(),
  }),
});

export const createGroupSchema = z.object({
  data: z.object({
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    description: z
      .string()
      .min(2, "Descrição deve ter no mínimo 2 caracteres")
      .optional(),
    sports: z
      .array(
        z.string({
          error:
            "Valor diferente de string encotrado, todos os esportes devem ser strings",
        }),
      )
      .optional(),
    VerificationRequest: z.boolean(),
  }),
});

export const updateGroupSchema = z.object({
  params: z.object({
    name: z.string(),
  }),
  data: z.object({
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").optional(),
    description: z
      .string()
      .min(2, "Descrição deve ter no mínimo 2 caracteres")
      .optional(),
    sports: z
      .array(
        z.string({
          error:
            "Valor diferente de string encotrado, todos os esportes devem ser strings",
        }),
      )
      .optional(),
      VerificationRequest: z.boolean().optional(),
  }),
});

export const deleteGroupSchema = z.object({
  params: z.object({
    name: z.string(),
  }),
});
