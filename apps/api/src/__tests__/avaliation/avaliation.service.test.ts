import { ApiError } from "../../utils/ApiError";
import HttpStatus from "http-status";
import avaliationService from "../../modules/avaliation/avaliation.service";
import avaliationRepository from "../../modules/avaliation/avaliation.repository";

jest.mock("../../modules/avaliation/avaliation.repository")

describe("avaliationService", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("findAllAvals", () => {
        it("Deve retornar uma lista com todas as avalições no banco", async () => {
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

            (avaliationRepository.findAllAvals as jest.Mock).mockResolvedValue(avalsData)

            const avals = await avaliationService.findAllAvals();

            expect(avals).toEqual(avalsData);
            expect(avaliationRepository.findAllAvals).toHaveBeenCalled()
        })
    })

    describe("findAllAvalsByUserId", () => {
        it("Deve retornar uma lista com todas as avalições de um determinado usuário", async () => {
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

            (avaliationRepository.findAllAvalsByUserId as jest.Mock).mockResolvedValue(avalsData)

            const avals = await avaliationService.findAllAvalsByUserId("U1");

            expect(avals).toEqual(avalsData);
            expect(avaliationRepository.findAllAvalsByUserId).toHaveBeenCalledWith("U1")
        })
    })

    describe("findAvalById", () => {
        it("Deve retornar uma avalição pelo id", async () => {
            const avalData =
            {
                id: "A1",
                userId: "U1",
                score: 5,
                message: "gostei",
                createdAt: new Date()
            };

            (avaliationRepository.findAvalById as jest.Mock).mockResolvedValue(avalData)

            const aval = await avaliationService.findAvalById("A1");

            expect(aval).toEqual(avalData);
            expect(avaliationRepository.findAvalById).toHaveBeenCalledWith("A1")
        })
    })

    describe("createAval", () => {
        it("Deve criar e retornar uma avaliação", async () => {
            const mockAvalData = {
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

            (avaliationRepository.createAval as jest.Mock).mockResolvedValue(createdAvalData);

            const newAval = await avaliationService.createAval(mockAvalData, "U1")

            expect(newAval).toEqual(createdAvalData)
            expect(avaliationRepository.createAval).toHaveBeenCalledWith(mockAvalData, "U1")
        })

        it("Deve retornar 400 caso o id do usuário seja passado", async () => {
            const mockAvalData = {
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

            (avaliationRepository.createAval as jest.Mock).mockResolvedValue(createdAvalData);

            await expect(avaliationService.createAval(mockAvalData, undefined)).rejects.toThrow(ApiError);
            await expect(avaliationService.createAval(mockAvalData, undefined)).rejects.toMatchObject({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Id do usuário não foi recebido corretamente"
            });

            expect(avaliationRepository.createAval).toHaveBeenCalledTimes(0)
        })

        it("Deve retornar 400 caso a pontuação passada estoure os limites", async () => {
            const mockAvalData = {
                score: 7,
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

            (avaliationRepository.createAval as jest.Mock).mockResolvedValue(createdAvalData);

            await expect(avaliationService.createAval(mockAvalData, undefined)).rejects.toThrow(ApiError);
            await expect(avaliationService.createAval(mockAvalData, undefined)).rejects.toMatchObject({
                statusCode: HttpStatus.BAD_REQUEST,
            });

            expect(avaliationRepository.createAval).toHaveBeenCalledTimes(0)
        })
    })

    describe("updateAval", () => {
        it("Deve atualizar e retornar uma avaliação", async () => {
            const mockAvalData = {
                message: "gostei demais",
            }

            const updatedAvalData = {
                id: "A1",
                userId: "U1",
                score: 5,
                message: "gostei demais",
                createdAt: new Date()
            };

            (avaliationRepository.updateAval as jest.Mock).mockResolvedValue(updatedAvalData);

            const updatedAval = await avaliationService.updateAval(mockAvalData, "A1");

            expect(updatedAval).toEqual(updatedAvalData);
            expect(avaliationRepository.updateAval).toHaveBeenCalledWith("A1", mockAvalData)
        })

        it("Deve retornar 400 caso o id não seja passado corretamente", async () => {
            const mockAvalData = {
                message: "gostei demais",
            }

            const updatedAvalData = {
                id: "A1",
                userId: "U1",
                score: 5,
                message: "gostei demais",
                createdAt: new Date()
            };

            (avaliationRepository.updateAval as jest.Mock).mockResolvedValue(updatedAvalData);

            await expect(avaliationService.updateAval(mockAvalData, null)).rejects.toThrow(ApiError);
            await expect(avaliationService.updateAval(mockAvalData, null)).rejects.toMatchObject({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "O id da avaliação não foi recebido corretamente"
            });

            expect(avaliationRepository.updateAval).toHaveBeenCalledTimes(0)
        })
    })

    describe("deleteAval", () => {
        it("Deve excluir a avaliação e não retornar nada", async () => {
            (avaliationRepository.deleteAval as jest.Mock).mockResolvedValue(undefined);

            await expect(avaliationService.deleteAval("A1")).resolves.toBeUndefined;
            expect(avaliationRepository.deleteAval).toHaveBeenCalledWith("A1")
        })

        it("Deve retornar 400 caso o id não seja passado corretamente", async () => {
            (avaliationRepository.deleteAval as jest.Mock).mockResolvedValue(undefined);

            await expect(avaliationService.deleteAval(null)).rejects.toThrow(ApiError);
            await expect(avaliationService.deleteAval(null)).rejects.toMatchObject({
                statusCode: HttpStatus.BAD_REQUEST
            });

            expect(avaliationRepository.deleteAval).toHaveBeenCalledTimes(0);
        })
    })
})