import { error } from "console";
import { Request, Response, NextFunction } from "express";

const AUTH_MODE = process.env.AUTH_MODE ?? "mock";

function parseDevHeader(header: string | undefined) {
  if (!header) return null;

  const parts = header.split(" ");
  if (parts.length !== 2) return null;

  const token = parts[1];
  if (!token) return null;
  if (!token.startsWith("user:")) return null;
  const userId = token.slice("user:".length).trim();
  return userId || null;
}

export async function auth(req: Request, res: Response, next: NextFunction) {
  if (AUTH_MODE === "mock") {
    const devHeaderUser = parseDevHeader(
      req.headers.authorization as string | undefined,
    );
    const devUserFromEnv =
      process.env.DEV_USER_ID && process.env.DEV_USER_ID.trim() !== ""
        ? process.env.DEV_USER_ID
        : null;
    if (devHeaderUser) {
      (req as any).user = {
        id: devHeaderUser,
        jti: "dev",
      };
      return next();
    }
    if (devUserFromEnv) {
      (req as any).user = {
        id: devHeaderUser,
        jti: "dev",
      };
      return next();
    }

    return res
      .status(401)
      .json({
        error:
          "Faltando dev auth header: Use 'Authorization: Bearer user:<user_id>'",
      });
  }

  return res.status(401).json({ error: "Formato de validação invalido" });
}
