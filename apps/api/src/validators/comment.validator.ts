import { Request, Response, NextFunction } from "express";
import HttpStatus from "http-status";

export function validateComment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { content } = req.body;
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ message: "Conteúdo é obrigatório" });
  }
  return next();
}
export function validateCommentPayload(body: unknown) {
  const b = (body as { text?: unknown }) || {};
  const { text } = b;
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return { valid: false, message: "Campo texto é obrigatório." };
  }
  if (text.length > 2000) {
    return { valid: false, message: "Comentário muito longo." };
  }
  return { valid: true };
}
