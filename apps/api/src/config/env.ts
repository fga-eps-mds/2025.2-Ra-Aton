// src/config/env.ts
import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

// Carrega o arquivo .env da raiz do projeto
// __dirname se refere ao diretório atual (src/config),
// por isso subimos dois níveis ('../../')
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Define o schema de validação para as variáveis de ambiente.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Converte a string '3000' (do .env) para o número 3000
  PORT: z.coerce.number().default(4000),

  // Variáveis do Banco de Dados
  DATABASE_URL: z.string().url("DATABASE_URL deve ser uma URL válida"),

  // Variáveis do JWT
  JWT_SECRET: z.string().min(1, "JWT_SECRET não pode estar vazio"),
  JWT_EXPIRES_IN: z.string().min(1, "JWT_EXPIRES_IN não pode estar vazio"),

  // Expo Push Notifications
  EXPO_ACCESS_TOKEN: z.string().optional(),
});

/**
 * Tenta validar process.env contra o schema definido.
 */
const parseResult = envSchema.safeParse(process.env);

/**
 * Se a validação falhar, loga os erros e encerra a aplicação.
 * Isso garante que a aplicação nunca rode com configuração inválida.
 */
if (!parseResult.success) {
  console.error("❌ Erros de validação nas variáveis de ambiente:");
  // Formata os erros do Zod para serem mais legíveis no console
  console.error(parseResult.error.format());

  // Encerra a aplicação
  throw new Error(
    "Variáveis de ambiente inválidas. Verifique seu .env e reinicie.",
  );
}

/**
 * Exporta o objeto 'config' validado e 100% tipado.
 * O resto da aplicação DEVE importar deste arquivo, não usar 'process.env'
 */
export const config = parseResult.data;
