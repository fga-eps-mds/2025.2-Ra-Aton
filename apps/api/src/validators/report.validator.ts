import { Request, Response, NextFunction } from "express";
import HttpStatus from "http-status";

export function validateReport(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { reason, postId, commentId } = req.body;
  if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ message: "Motivo é obrigatório" });
  }
  if (!postId && !commentId) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ message: "postId ou commentId é obrigatório" });
  }
  return next();
}
export function validateReportPayload(body: unknown) {
  const b =
    (body as {
      tipoConteudo?: unknown;
      idConteudo?: unknown;
      motivo?: unknown;
    }) || {};
  const { tipoConteudo, idConteudo, motivo } = b;
  if (!tipoConteudo || !idConteudo || !motivo) {
    return {
      valid: false,
      message: "Campos obrigatórios: tipoConteudo, idConteudo, motivo.",
    };
  }
  if (
    typeof tipoConteudo !== "string" ||
    !["post", "comment"].includes(tipoConteudo)
  ) {
    return { valid: false, message: "tipoConteudo inválido." };
  }
  return { valid: true };
}
