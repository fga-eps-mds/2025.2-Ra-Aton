import { z } from "zod";

const allowedMadeBy = ["GROUP", "USER"] as const;
const allowedJoinRequestStatus = ["PENDING", "APPROVED", "REJECTED"] as const;

export const findInviteSchema = z.object({
  params: z.object({
    id: z.uuid(),
    type: z.string().optional(),
  }),
});

export const createInviteSchema = z.object({
  body: z.object({
    userId: z.uuid(),
    groupId: z.uuid(),
    madeBy: z
      .string()
      .transform((val) => val.toUpperCase())
      .refine((val) => allowedMadeBy.includes(val as any), {
        message: "Estatus de madeBy inválido",
      }),
    message: z.string().optional(),
  }),
});

export const updateInviteSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
  body: z.object({
    madeBy: z
      .string()
      .transform((val) => val.toUpperCase())
      .refine((val) => allowedMadeBy.includes(val as any), {
        message: "Estatus de madeBy inválido",
      })
      .optional(),
    message: z.string().optional(),
    status: z
      .string()
      .transform((val) => val.toUpperCase())
      .refine((val) => allowedJoinRequestStatus.includes(val as any), {
        message: "Estatus de verificação inválido",
      })
      .optional(),
  }),
});

export const deleteInviteSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});
