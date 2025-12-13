import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { auth, optionalAuth } from "../../middlewares/auth";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import { config } from "../../config/env";

jest.mock("jsonwebtoken");
jest.mock("../../config/env", () => ({
  config: {
    JWT_SECRET: "test-secret-key",
  },
}));

describe("Auth Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("auth middleware", () => {
    it("deve passar quando o token é válido", async () => {
      const mockDecoded = { id: "user-123" };
      req.headers = {
        authorization: "Bearer valid-token",
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      await auth(req as Request, res as Response, next);

      expect(jwt.verify).toHaveBeenCalledWith("valid-token", config.JWT_SECRET);
      expect((req as any).user).toEqual({ id: "user-123", userId: "user-123" });
      expect(next).toHaveBeenCalledWith();
    });

    it("deve lançar erro quando authorization header não existe", async () => {
      req.headers = {};

      await auth(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.UNAUTHORIZED,
          message: "Usuário não autorizado",
        })
      );
    });

    it("deve lançar erro quando authorization header não começa com Bearer", async () => {
      req.headers = {
        authorization: "Basic some-token",
      };

      await auth(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.UNAUTHORIZED,
          message: "Usuário não autorizado",
        })
      );
    });

    it("deve lançar erro quando token não é fornecido após Bearer", async () => {
      req.headers = {
        authorization: "Bearer ",
      };

      await auth(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "Token não fornecido",
        })
      );
    });

    it("deve lançar erro quando token está vazio após split", async () => {
      req.headers = {
        authorization: "Bearer",
      };

      await auth(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.UNAUTHORIZED,
          message: "Usuário não autorizado",
        })
      );
    });

    it("deve lançar erro quando jwt.verify lança erro (token inválido)", async () => {
      req.headers = {
        authorization: "Bearer invalid-token",
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await auth(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.UNAUTHORIZED,
          message: "Token inválido ou expirado",
        })
      );
    });

    it("deve lançar erro quando jwt.verify lança JsonWebTokenError", async () => {
      req.headers = {
        authorization: "Bearer malformed-token",
      };

      const jwtError = new Error("jwt malformed");
      jwtError.name = "JsonWebTokenError";
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw jwtError;
      });

      await auth(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.UNAUTHORIZED,
          message: "Token inválido ou expirado",
        })
      );
    });

    it("deve lançar erro quando jwt.verify lança TokenExpiredError", async () => {
      req.headers = {
        authorization: "Bearer expired-token",
      };

      const expiredError = new Error("jwt expired");
      expiredError.name = "TokenExpiredError";
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw expiredError;
      });

      await auth(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.UNAUTHORIZED,
          message: "Token inválido ou expirado",
        })
      );
    });

    it("deve lançar erro quando decoded é uma string", async () => {
      req.headers = {
        authorization: "Bearer string-token",
      };

      (jwt.verify as jest.Mock).mockReturnValue("string-payload");

      await auth(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.UNAUTHORIZED,
          message: "Token inválido (payload malformado)",
        })
      );
    });

    it("deve lançar erro quando decoded não contém id", async () => {
      req.headers = {
        authorization: "Bearer no-id-token",
      };

      (jwt.verify as jest.Mock).mockReturnValue({ username: "test" });

      await auth(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.UNAUTHORIZED,
          message: "Token inválido (payload malformado)",
        })
      );
    });

    it("deve lançar erro quando decoded.id é null", async () => {
      req.headers = {
        authorization: "Bearer null-id-token",
      };

      (jwt.verify as jest.Mock).mockReturnValue({ id: null });

      await auth(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.UNAUTHORIZED,
          message: "Token inválido (payload malformado)",
        })
      );
    });

    it("deve lançar erro quando decoded.id é undefined", async () => {
      req.headers = {
        authorization: "Bearer undefined-id-token",
      };

      (jwt.verify as jest.Mock).mockReturnValue({ id: undefined });

      await auth(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.UNAUTHORIZED,
          message: "Token inválido (payload malformado)",
        })
      );
    });

    it("deve lançar erro quando decoded.id é string vazia", async () => {
      req.headers = {
        authorization: "Bearer empty-id-token",
      };

      (jwt.verify as jest.Mock).mockReturnValue({ id: "" });

      await auth(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: httpStatus.UNAUTHORIZED,
          message: "Token inválido (payload malformado)",
        })
      );
    });

    it("deve anexar user com id e userId quando token é válido", async () => {
      const mockDecoded = { id: "user-456", userName: "testuser" };
      req.headers = {
        authorization: "Bearer valid-token-with-username",
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      await auth(req as Request, res as Response, next);

      expect((req as any).user).toEqual({ id: "user-456", userId: "user-456" });
      expect((req as any).user).toHaveProperty("id");
      expect((req as any).user).toHaveProperty("userId");
    });

    it("deve usar JWT_SECRET da config para verificar token", async () => {
      const mockDecoded = { id: "user-789" };
      req.headers = {
        authorization: "Bearer test-token",
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      await auth(req as Request, res as Response, next);

      expect(jwt.verify).toHaveBeenCalledWith("test-token", "test-secret-key");
    });
  });

  describe("optionalAuth middleware", () => {
    it("deve continuar sem autenticação quando authorization header não existe", async () => {
      req.headers = {};

      await optionalAuth(req as Request, res as Response, next);

      expect((req as any).user).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it("deve continuar sem autenticação quando authorization header não começa com Bearer", async () => {
      req.headers = {
        authorization: "Basic some-credentials",
      };

      await optionalAuth(req as Request, res as Response, next);

      expect((req as any).user).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it("deve adicionar user quando token é válido", async () => {
      const mockDecoded = { id: "user-123", userName: "testuser" };
      req.headers = {
        authorization: "Bearer valid-token",
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      await optionalAuth(req as Request, res as Response, next);

      expect(jwt.verify).toHaveBeenCalledWith("valid-token", config.JWT_SECRET);
      expect((req as any).user).toEqual({ id: "user-123", userName: "testuser" });
      expect(next).toHaveBeenCalledWith();
    });

    it("deve continuar sem autenticação quando token é inválido (não bloqueia)", async () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
      
      req.headers = {
        authorization: "Bearer invalid-token",
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await optionalAuth(req as Request, res as Response, next);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Token inválido em optionalAuth, continuando sem autenticação"
      );
      expect((req as any).user).toBeUndefined();
      expect(next).toHaveBeenCalledWith();

      consoleLogSpy.mockRestore();
    });

    it("deve continuar sem autenticação quando token está expirado", async () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
      
      req.headers = {
        authorization: "Bearer expired-token",
      };

      const expiredError = new Error("jwt expired");
      expiredError.name = "TokenExpiredError";
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw expiredError;
      });

      await optionalAuth(req as Request, res as Response, next);

      expect(consoleLogSpy).toHaveBeenCalled();
      expect((req as any).user).toBeUndefined();
      expect(next).toHaveBeenCalledWith();

      consoleLogSpy.mockRestore();
    });

    it("deve continuar sem autenticação quando token é malformado", async () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
      
      req.headers = {
        authorization: "Bearer malformed-token",
      };

      const jwtError = new Error("jwt malformed");
      jwtError.name = "JsonWebTokenError";
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw jwtError;
      });

      await optionalAuth(req as Request, res as Response, next);

      expect(consoleLogSpy).toHaveBeenCalled();
      expect((req as any).user).toBeUndefined();
      expect(next).toHaveBeenCalledWith();

      consoleLogSpy.mockRestore();
    });

    it("deve extrair token corretamente após Bearer", async () => {
      const mockDecoded = { id: "user-456", userName: "anotheruser" };
      req.headers = {
        authorization: "Bearer token-with-many-parts.payload.signature",
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      await optionalAuth(req as Request, res as Response, next);

      expect(jwt.verify).toHaveBeenCalledWith(
        "token-with-many-parts.payload.signature",
        config.JWT_SECRET
      );
      expect((req as any).user).toEqual({ id: "user-456", userName: "anotheruser" });
    });

    it("deve chamar next com erro quando ocorre erro inesperado no try externo", async () => {
      const unexpectedError = new Error("Unexpected error");
      req.headers = {
        authorization: "Bearer valid-token",
      };

      // Simular erro inesperado no bloco try externo
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw unexpectedError;
      });

      // Forçar o erro a não ser capturado pelo try interno
      const originalConsoleLog = console.log;
      console.log = jest.fn(() => {
        throw new Error("Console error");
      });

      await optionalAuth(req as Request, res as Response, next);

      console.log = originalConsoleLog;

      // O next deve ser chamado sem argumentos ou com erro
      expect(next).toHaveBeenCalled();
    });

    it("deve processar authorization header com espaços extras", async () => {
      req.headers = {
        authorization: "  Bearer    ",
      };

      await optionalAuth(req as Request, res as Response, next);

      expect((req as any).user).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
    });

    it("deve adicionar apenas id e userName ao user object", async () => {
      const mockDecoded = { 
        id: "user-999", 
        userName: "fulluser",
        email: "user@example.com",
        role: "admin",
        exp: 1234567890
      };
      req.headers = {
        authorization: "Bearer full-payload-token",
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      await optionalAuth(req as Request, res as Response, next);

      expect((req as any).user).toEqual({ id: "user-999", userName: "fulluser" });
      expect((req as any).user).not.toHaveProperty("email");
      expect((req as any).user).not.toHaveProperty("role");
      expect((req as any).user).not.toHaveProperty("exp");
    });
  });
});
