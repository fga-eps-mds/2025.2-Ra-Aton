import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { ZodError } from "zod";
import httpStatus from "http-status";

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err); // Sempre logue o erro

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(httpStatus.BAD_REQUEST).json({
      error: "Erro de validação",
      issues: err.issues,
    });
  }

  return res
    .status(httpStatus.INTERNAL_SERVER_ERROR)
    .json({ error: "Erro interno do servidor" });
};
