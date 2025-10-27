import { z } from "zod";

/**
 * Schema para validar o body da rota de login.
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Formato de email inválido"),

    password: z.string().min(1, "Senha é obrigatória"), // Apenas checa se não está vazia
  }),
});
