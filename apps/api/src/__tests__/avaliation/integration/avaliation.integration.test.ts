import request from "supertest";
import app from "../../../app"; // Ajuste o caminho conforme sua estrutura de pastas
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import { config } from "../../../config/env";

// Mock do userService para o middleware de auth)
jest.mock("../../../modules/user/user.service", () => ({
    userService: {
        getUserById: jest.fn(),
    },
}));

// Mock do AvaliationRepository
jest.mock("../../../modules/avaliation/avaliation.repository", () => ({
    __esModule: true,
    default: {
        findAllAvals: jest.fn(),
        findAllAvalsByUserId: jest.fn(),
        findAvalById: jest.fn(),
        createAval: jest.fn(),
        updateAval: jest.fn(),
        deleteAval: jest.fn(),
    },
}));

import AvaliationRepository from "../../../modules/avaliation/avaliation.repository";
import { userService } from "../../../modules/user/user.service";

const AUTH_USER_ID = "00000000-0000-4000-8000-000000000001";
const AVAL_ID = "11111111-1111-4111-8111-111111111111";

const generateToken = (id: string) =>
    jwt.sign({ id }, config.JWT_SECRET || "secret", { expiresIn: "1h" });

describe("Integração - Módulo de Avaliação", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock do usuário autenticado padrão
        (userService.getUserById as jest.Mock).mockResolvedValue({
            id: AUTH_USER_ID,
            userName: "Usuario Teste",
            email: "teste@email.com",
        });
    });

    describe("GET avaliation/", () => {
        it("deve listar todas as avaliações", async () => {
            (AvaliationRepository.findAllAvals as jest.Mock).mockResolvedValue([
                {
                    id: AVAL_ID,
                    score: 5,
                    message: "Ótimo serviço",
                    userId: AUTH_USER_ID,
                },
            ]);

            const res = await request(app).get("/avaliation").expect(httpStatus.OK);

            expect(res.body.length).toBe(1);
            expect(res.body[0].message).toBe("Ótimo serviço");
        });
    })

    describe("GET avaliation/user", () => {
        it("deve listar avaliações do usuário logado", async () => {
            const token = generateToken(AUTH_USER_ID);

            (AvaliationRepository.findAllAvalsByUserId as jest.Mock).mockResolvedValue([
                {
                    id: AVAL_ID,
                    score: 4,
                    message: "Muito bom",
                    userId: AUTH_USER_ID,
                },
            ]);

            const res = await request(app)
                .get("/avaliation/user")
                .set("Authorization", `Bearer ${token}`)
                .expect(httpStatus.OK);

            expect(res.body).toHaveLength(1);
            expect(AvaliationRepository.findAllAvalsByUserId).toHaveBeenCalledWith(AUTH_USER_ID);
        });

        it("deve retornar 401 se tentar buscar avaliações do usuário sem estar logado", async () => {
            await request(app).get("/avaliation/user").expect(httpStatus.UNAUTHORIZED);
        });
    })

    describe("GET avaliation/:id", () => {
        it("deve retornar a avaliação se encontrada", async () => {
            (AvaliationRepository.findAvalById as jest.Mock).mockResolvedValue({
                id: AVAL_ID,
                score: 5,
                message: "Teste",
            });

            const res = await request(app)
                .get(`/avaliation/${AVAL_ID}`)
                .expect(httpStatus.FOUND);

            expect(res.body.id).toBe(AVAL_ID);
        });

        it("deve retornar 404 se a avaliação não existir", async () => {
            (AvaliationRepository.findAvalById as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .get(`/avaliation/${AVAL_ID}`)
                .expect(httpStatus.NOT_FOUND);

            expect(res.body.error).toBe("Avalição não foi encontrada");
        });
    })

    describe("POST avaliation/ ", () => {
        it("deve criar avaliação com sucesso", async () => {
            const token = generateToken(AUTH_USER_ID);

            (AvaliationRepository.createAval as jest.Mock).mockResolvedValue({
                id: "new-aval-id",
                score: 5,
                message: "Excelente",
                userId: AUTH_USER_ID,
            });

            const res = await request(app)
                .post("/avaliation")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    score: 5,
                    message: "Excelente",
                })
                .expect(httpStatus.CREATED);

            expect(res.body.id).toBe("new-aval-id");
            expect(AvaliationRepository.createAval).toHaveBeenCalledWith(
                expect.objectContaining({ score: 5, message: "Excelente" }),
                AUTH_USER_ID
            );
        });

        it("deve retornar 400 se o score for inválido (maior que 5)", async () => {
            const token = generateToken(AUTH_USER_ID);

            const res = await request(app)
                .post("/avaliation")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    score: 6,
                    message: "Impossível",
                })
                .expect(httpStatus.BAD_REQUEST);

        });
    })

    describe("PATCH avaliation/:id", () => {
        it("deve atualizar avaliação com sucesso", async () => {
            (AvaliationRepository.updateAval as jest.Mock).mockResolvedValue({
                id: AVAL_ID,
                score: 3,
                message: "Atualizado",
            });

            const res = await request(app)
                .patch(`/avaliation/${AVAL_ID}`)
                .send({
                    message: "Atualizado",
                })
                .expect(httpStatus.OK);

            expect(res.body.message).toBe("Atualizado");
            expect(AvaliationRepository.updateAval).toHaveBeenCalledWith(
                AVAL_ID,
                expect.objectContaining({ message: "Atualizado" })
            );
        });
    })

    describe("DELETE avaliation/:id", () => {
        it("deve excluir avaliação com sucesso", async () => {
            (AvaliationRepository.deleteAval as jest.Mock).mockResolvedValue(undefined);

            await request(app)
                .delete(`/avaliation/${AVAL_ID}`)
                .expect(httpStatus.NO_CONTENT);

            expect(AvaliationRepository.deleteAval).toHaveBeenCalledWith(AVAL_ID);
        });
    })
});