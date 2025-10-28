import { z } from "zod";

// Constante com os valores permitidos
const allowedProfileType = ["JOGADOR", "TORCEDOR", "ATLETICA"] as const;

/**
 * Schema para Criação de Usuário (POST /users)
 */
export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    userName: z.string().min(1, "Username é obrigatório").trim(),
    email: z
      .email("Formato de email inválido")
      .transform((val) => val.toLowerCase().trim()),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  }),
});

/**
 * Schema para Buscar Usuário (GET /users/:userName)
 */
export const getUserSchema = z.object({
  params: z.object({
    userName: z.string().min(1, "Username é obrigatório"),
  }),
});

/**
 * Schema para Atualizar Usuário (PATCH /users/:userName)
 */
export const updateUserSchema = z.object({
  params: z.object({
    userName: z.string().min(1, "Username é obrigatório"),
  }),
  body: z
    .object({
      name: z
        .string()
        .min(2, "Nome deve ter no mínimo 2 caracteres")
        .trim()
        .optional(),

      newUserName: z
        .string()
        .min(1, "Username é obrigatório")
        .trim()
        .optional(),

      email: z
        .string()
        .email("Formato de email inválido")
        .transform((val) => val.toLowerCase().trim())
        .optional(),

      // --- CORREÇÃO APLICADA AQUI ---
      profileType: z
        .string()
        .transform((val) => val.toUpperCase())
        .refine(
          // Checa se o valor MAIÚSCULO está no array
          (val) => allowedProfileType.includes(val as any),
          { message: "Profile type inválido" }, // Mensagem de erro customizada
        )
        .optional(),
      // --- FIM DA CORREÇÃO ---
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Nenhuma mudança encontrada",
    }),
});

/**
 * Schema para Deletar Usuário (DELETE /users/:userName)
 */
export const deleteUserSchema = z.object({
  params: z.object({
    userName: z.string().min(1, "Username é obrigatório"),
  }),
});
