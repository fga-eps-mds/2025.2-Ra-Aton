import { z } from "zod";

const allowedRoles = ["ADMIN", "MEMBER"] as const;

export const findMemberSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});

export const createMemberSchema = z.object({
  body: z.object({
    userId: z.uuid(),
    groupId: z.uuid(),
  }),
});

export const updateMemberSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
  body: z.object({
    role: z
      .string()
      .transform((val) => val.toUpperCase())
      .refine((val) => allowedRoles.includes(val as any), {
        message: "Cargo inválido",
      })
      .optional(),
    isCreator: z.boolean().optional(),
  }),
});

export const deleteMemberSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});
