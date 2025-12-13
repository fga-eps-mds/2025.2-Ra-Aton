import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { catchAsync } from "../utils/catchAsync"; // Não se esqueça deste import
import httpStatus from "http-status";
import { config } from "../config/env";
export const auth = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Usuário não autorizado");
    }

    const token = authHeader.split(" ")[1];

    // --- CORREÇÃO 1: Verificar se o token existe ---
    if (!token) {
      throw new ApiError(401, "Token não fornecido");
    }
    // ---------------------------------------------

    let decoded: string | jwt.JwtPayload; // Tipagem correta

    try {
      decoded = jwt.verify(
        token, // Agora o TypeScript sabe que 'token' é uma string
        config.JWT_SECRET || "secret",
      );
    } catch (err) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Token inválido ou expirado");
    }

    // --- CORREÇÃO 2: Verificar o payload decodificado ---
    // Precisamos garantir que o payload é um objeto e contém o ID
    if (typeof decoded === "string" || !decoded.id) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Token inválido (payload malformado)",
      );
    }
    // ----------------------------------------------------

    // Anexa o ID de forma segura
    (req as any).user = { id: decoded.id, userId: decoded.id };
    next();
  },
);

/**
 * Middleware de autenticação opcional
 * Não bloqueia se o token não existir, apenas o adiciona se existir
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        (req as any).user = { id: decoded.id, userName: decoded.userName };
      } catch (error) {
        // Token inválido, mas não bloqueia a requisição
        console.log("Token inválido em optionalAuth, continuando sem autenticação");
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
