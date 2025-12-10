import { Request, Response } from "express";
import httpStatus from "http-status";
import avaliationController from "../../modules/avaliation/avaliation.controller";
import avaliationService from "../../modules/avaliation/avaliation.service";

jest.mock("../../modules/avaliation/avaliation.service");

describe("AvaliationController", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("findAllAvals", () => {
        it("Deve retornar todas as avaliações presentes na database e status 200", async () => {
            const avalsData = [
                {
                    id: "A1",
                    userId: "U1",
                    score: 5,
                    message: "gostei",
                    createdAt: new Date()
                },
                {
                    id: "A2",
                    userId: "U1",
                    score: 1,
                    message: "não gostei",
                    createdAt: new Date()
                }
            ];

            (avaliationService.findAllAvals as jest.Mock).mockResolvedValue(avalsData)

            await avaliationController.findAllAvals(
                req as Request,
                res as Response,
            );

            expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
            expect(res.json).toHaveBeenCalledWith(avalsData)
            expect(avaliationService.findAllAvals).toHaveBeenCalled()
        })
    })

    describe("findAllAvalsByUserId", () => {
        it("Deve retornar todas as avaliações de um determinado usuário presentes na database e status 200", async () => {
            const avalsData = [
                {
                    id: "A1",
                    userId: "U1",
                    score: 5,
                    message: "gostei",
                    createdAt: new Date()
                },
                {
                    id: "A2",
                    userId: "U1",
                    score: 1,
                    message: "não gostei",
                    createdAt: new Date()
                }
            ];

            (avaliationService.findAllAvalsByUserId as jest.Mock).mockResolvedValue(avalsData)

            req.user = { id: "U1", userId: "U1" };
            await avaliationController.findAllAvalsByUserId(
                req as Request,
                res as Response,
            );

            expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
            expect(res.json).toHaveBeenCalledWith(avalsData)
            expect(avaliationService.findAllAvalsByUserId).toHaveBeenCalled()
        })

        it("Deve retornar 401 caso o usuário não esteja autenticado", async () => {
            const avalsData = [
                {
                    id: "A1",
                    userId: "U1",
                    score: 5,
                    message: "gostei",
                    createdAt: new Date()
                },
                {
                    id: "A2",
                    userId: "U1",
                    score: 1,
                    message: "não gostei",
                    createdAt: new Date()
                }
            ];

            (avaliationService.findAllAvalsByUserId as jest.Mock).mockResolvedValue(avalsData)

            await avaliationController.findAllAvalsByUserId(
                req as Request,
                res as Response,
            );

            expect(res.status).toHaveBeenCalledWith(httpStatus.UNAUTHORIZED);
            expect(res.json).toHaveBeenCalledWith({ message: "Usuário não está autenticado" })
        })
    })

    describe("findAvalById", () => {
        it("Deve retornar todas as avaliações presentes na database e status 200", async () => {
            const avalData =
            {
                id: "A1",
                userId: "U1",
                score: 5,
                message: "gostei",
                createdAt: new Date()
            };

            (avaliationService.findAvalById as jest.Mock).mockResolvedValue(avalData)
            req.params = { id: "A1" }
            await avaliationController.findAvalById(
                req as Request,
                res as Response,
            );

            expect(res.status).toHaveBeenCalledWith(httpStatus.FOUND);
            expect(res.json).toHaveBeenCalledWith(avalData)
            expect(avaliationService.findAvalById).toHaveBeenCalled()
        })

        it("Deve retornar status 400 caso o id não seja passado corretamente", async () => {
            const avalData =
            {
                id: "A1",
                userId: "U1",
                score: 5,
                message: "gostei",
                createdAt: new Date()
            };

            (avaliationService.findAvalById as jest.Mock).mockResolvedValue(avalData)

            req.params = {}
            await avaliationController.findAvalById(
                req as Request,
                res as Response,
            );

            expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
            expect(res.json).toHaveBeenCalledWith({ message: "O id da avaliação não foi recebido corretamente" })
        })
    })

    describe("createAval", () => {
        it("Deve criar e retornar a avaliação com status 201", async () => {
            req.body = {
                score: 5,
                message: "gostei",
                user: {
                    connect: {
                        id: "U1"
                    }
                }
            };

            const createdAvalData = {
                id: "A1",
                userId: "U1",
                score: 5,
                message: "gostei",
                createdAt: new Date()
            };

            (avaliationService.createAval as jest.Mock).mockResolvedValue(createdAvalData);

            req.user = { id: "U1", userId: "U1" };
            await avaliationController.createAval(
                req as Request,
                res as Response,
            )

            expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
            expect(res.json).toHaveBeenCalledWith(createdAvalData)
            expect(avaliationService.createAval).toHaveBeenCalled()
        })

        it("Deve criar e retornar status 401 caso o usuário não esteja autorizado", async () => {
            req.body = {
                score: 5,
                message: "gostei",
                user: {
                    connect: {
                        id: "U1"
                    }
                }
            };

            const createdAvalData = {
                id: "A1",
                userId: "U1",
                score: 5,
                message: "gostei",
                createdAt: new Date()
            };

            (avaliationService.createAval as jest.Mock).mockResolvedValue(createdAvalData);

            await avaliationController.createAval(
                req as Request,
                res as Response,
            )

            expect(res.status).toHaveBeenCalledWith(httpStatus.UNAUTHORIZED);
            expect(res.json).toHaveBeenCalledWith({ message: "Usuário não está autenticado" })
        })
    })

    describe("updateAval", () => {
        it("Deve atualizar e retornar uma avaliação com status 200", async () => {
            req.body = {
                message: "gostei demais",
            };

            const updatedAvalData = {
                id: "A1",
                userId: "U1",
                score: 5,
                message: "gostei demais",
                createdAt: new Date()
            };

            (avaliationService.updateAval as jest.Mock).mockResolvedValue(updatedAvalData);

            req.params = { id: "A1" }
            await avaliationController.updateAval(
                req as Request,
                res as Response,
            )

            expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
            expect(res.json).toHaveBeenCalledWith(updatedAvalData)
            expect(avaliationService.updateAval).toHaveBeenCalled()
        })

        it("Deve atualizar e retornar uma avaliação com status 200", async () => {
            req.body = {
                message: "gostei demais",
            };

            const updatedAvalData = {
                id: "A1",
                userId: "U1",
                score: 5,
                message: "gostei demais",
                createdAt: new Date()
            };

            (avaliationService.updateAval as jest.Mock).mockResolvedValue(updatedAvalData);

            req.params = {}
            await avaliationController.updateAval(
                req as Request,
                res as Response,
            )

            expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
            expect(res.json).toHaveBeenCalledWith({ message: "O id da avaliação não foi recebido corretamente" })
        })
    })

    describe("deleteAval", () => {
        it("Deve excluir uma avaliação e retornar 204", async () => {
            (avaliationService.deleteAval as jest.Mock).mockResolvedValue(undefined);

            req.params = { id: "A1" }
            await avaliationController.deleteAval(
                req as Request,
                res as Response,
            )

            expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
            expect(avaliationService.deleteAval).toHaveBeenCalledWith("A1")
        })

        it("Deve retornar 400", async () => {
            (avaliationService.deleteAval as jest.Mock).mockResolvedValue(undefined);

            req.params = {}
            await avaliationController.deleteAval(
                req as Request,
                res as Response,
            )

            expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
            expect(res.json).toHaveBeenCalledWith({ message: "O id da avaliação não foi recebido corretamente" })
        })
    })
})