import jwt from "jsonwebtoken";
import { config } from "../config/env";

/**
 * Gera um token JWT válido para usar nos testes de integração.
 *
 * @param userId - UUID do usuário que será inserido no payload do token
 * @returns token JWT assinado
 */
export function generateToken(userId: string): string {
  const secret = config.JWT_SECRET || "secret";

  return jwt.sign(
    { id: userId }, // payload que o middleware auth usa
    secret,
    { expiresIn: "1h" },
  );
}

export default generateToken;
