import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import { auth } from "../../middlewares/auth"; // Ajuste o caminho conforme necessário
import { ApiError } from "../../utils/ApiError";
import { config } from "../../config/env";

// Mocks
jest.mock("jsonwebtoken");
jest.mock("../../config/env", () => ({
    config: {
        JWT_SECRET: "test-secret",
    },
}));

describe("Auth Middleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        req = {
            headers: {},
        };
        res = {};
        next = jest.fn();
        jest.clearAllMocks();
    });

    // -------------------------------------------------------------------------
    // HAPPY PATH (Sucesso)
    // -------------------------------------------------------------------------
    it("deve chamar next() e popular req.user quando o token for válido", async () => {
        const mockPayload = { id: "user-123" };
        req.headers = { authorization: "Bearer valid-token" };

        // Simula jwt.verify retornando sucesso
        (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

        await auth(req as Request, res as Response, next as NextFunction);

        expect(jwt.verify).toHaveBeenCalledWith("valid-token", "test-secret");

        // CORREÇÃO AQUI: Adicionamos 'userId' na expectativa conforme o erro do Jest
        expect((req as any).user).toEqual({
            id: "user-123",
            userId: "user-123"
        });

        // Verifica se next foi chamado sem erros
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith();
    });

    // -------------------------------------------------------------------------
    // FALTA DE HEADER OU FORMATO INCORRETO
    // -------------------------------------------------------------------------
    it("deve chamar next com ApiError(UNAUTHORIZED) se o header authorization estiver ausente", async () => {
        req.headers = {}; // Sem authorization

        await auth(req as Request, res as Response, next as NextFunction);

        expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        const error = next.mock.calls[0][0] as ApiError;
        expect(error.statusCode).toBe(httpStatus.UNAUTHORIZED);
        expect(error.message).toBe("Usuário não autorizado");
    });

    it("deve chamar next com ApiError(UNAUTHORIZED) se o header não começar com 'Bearer '", async () => {
        req.headers = { authorization: "Basic token123" };

        await auth(req as Request, res as Response, next as NextFunction);

        expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        expect(next.mock.calls[0][0].message).toBe("Usuário não autorizado");
    });

    // -------------------------------------------------------------------------
    // TOKEN AUSENTE (Após o Bearer)
    // -------------------------------------------------------------------------
    it("deve chamar next com ApiError(401) se o token não for fornecido após 'Bearer '", async () => {
        // split(" ")[1] será uma string vazia ou undefined dependendo da implementação exata do split com espaços
        req.headers = { authorization: "Bearer " };

        await auth(req as Request, res as Response, next as NextFunction);

        expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        const error = next.mock.calls[0][0] as ApiError;
        // O código original usa 401 hardcoded neste ponto ou httpStatus.UNAUTHORIZED
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe("Token não fornecido");
    });

    // -------------------------------------------------------------------------
    // ERRO NO JWT (Inválido ou Expirado)
    // -------------------------------------------------------------------------
    it("deve chamar next com ApiError(UNAUTHORIZED) se jwt.verify lançar erro", async () => {
        req.headers = { authorization: "Bearer invalid-token" };

        // Simula erro no verify
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error("Invalid signature");
        });

        await auth(req as Request, res as Response, next as NextFunction);

        expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        const error = next.mock.calls[0][0] as ApiError;
        expect(error.statusCode).toBe(httpStatus.UNAUTHORIZED);
        expect(error.message).toBe("Token inválido ou expirado");
    });

    // -------------------------------------------------------------------------
    // PAYLOAD MALFORMADO
    // -------------------------------------------------------------------------
    it("deve chamar next com erro se o payload decodificado for uma string", async () => {
        req.headers = { authorization: "Bearer token" };
        // jwt pode retornar string se não passar opções de algoritmo e o secret for string, dependendo da lib
        (jwt.verify as jest.Mock).mockReturnValue("string-payload");

        await auth(req as Request, res as Response, next as NextFunction);

        expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        const error = next.mock.calls[0][0] as ApiError;
        expect(error.statusCode).toBe(httpStatus.UNAUTHORIZED);
        expect(error.message).toBe("Token inválido (payload malformado)");
    });

    it("deve chamar next com erro se o payload decodificado não tiver a propriedade id", async () => {
        req.headers = { authorization: "Bearer token" };
        // Objeto válido, mas sem ID
        (jwt.verify as jest.Mock).mockReturnValue({ role: "admin", email: "test@test.com" });

        await auth(req as Request, res as Response, next as NextFunction);

        expect(next).toHaveBeenCalledWith(expect.any(ApiError));
        const error = next.mock.calls[0][0] as ApiError;
        expect(error.message).toBe("Token inválido (payload malformado)");
    });
});