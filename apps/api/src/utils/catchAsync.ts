import { Request, Response, NextFunction } from "express";

/**
 * Wrapper para funções de controller assíncronas.
 * Captura qualquer erro e o passa para o 'next()',
 * que será pego pelo globalErrorHandler.
 */
export const catchAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
