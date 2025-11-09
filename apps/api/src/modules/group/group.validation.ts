import { z } from "zod";

const allowedVerificationStatus = ["PENDING", "VERIFIED", "REJECTED"] as const;

export const getGroupSchema = z.object({
  params: z.object({
    name: z.string(),
  }),
});

export const createGroupSchema = z.object({
  body: z.object({
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
    verificationRequest: z.boolean(),
  }),
});

export const updateGroupSchema = z.object({
  params: z.object({
    name: z.string(),
  }),
  body: z.object({
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
    VerificationStatus: z
      .string()
      .transform((val) => val.toUpperCase())
      .refine((val) => allowedVerificationStatus.includes(val as any), {
        message: "Estatus de verificação inválido",
      })
      .optional(),
  }),
});

export const deleteGroupSchema = z.object({
  params: z.object({
    name: z.string(),
  }),
});
