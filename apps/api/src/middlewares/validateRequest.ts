import { Request, Response, NextFunction } from "express";
// Use 'any' para máxima compatibilidade se 'AnyZodObject' não for encontrado
import { ZodObject, ZodRawShape } from "zod";

/**
 * Middleware que usa um schema Zod para validar 'body', 'query' e 'params'
 * de uma requisição.
 */
const validateRequest =
  (
    schema: ZodObject<ZodRawShape>, // Alterado para ZodObject<ZodRawShape>
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      // Passa o erro do Zod para o globalErrorHandler
      return next(error);
    }
  };

export default validateRequest;
