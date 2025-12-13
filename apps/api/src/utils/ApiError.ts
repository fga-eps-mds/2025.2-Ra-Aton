/**
 * Classe de Erro customizada para ser usada em toda a API.
 * O globalErrorHandler saberá como lidar com ela.
 */
export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string, stack = "") {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
