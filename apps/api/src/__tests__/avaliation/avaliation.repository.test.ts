import { prismaMock } from "../prisma-mock";
import { Prisma, Avaliation } from "@prisma/client"
import avaliationRepository from "../../modules/avaliation/avaliation.repository";

describe("AvaliationRepository", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    beforeEach(async () => {
        await prismaMock.avaliation.deleteMany();
    });
    afterAll(async () => {
        await prismaMock.$disconnect();
    });

    describe("findAllAvals", () => {
        it("Deve retornar uma lista com todas as avaliações feitas", async () => {
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

            prismaMock.avaliation.findMany.mockResolvedValue(avalsData as Avaliation[]);

            const avals = await avaliationRepository.findAllAvals();


            expect(avals).toBe(avalsData)
            expect(prismaMock.avaliation.findMany).toHaveBeenCalledWith({
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: { id: true, userName: true, email: true },
                    }
                }
            })
        })
    })
    describe("findAllAvalsByUserId", () => {
        it("Deve retornar uma lista com todas as avaliações feitas pelo usuário logado", async () => {
            const USER_ID = "U1"
            const avalsData = [
                {
                    id: "A1",
                    userId: USER_ID,
                    score: 5,
                    message: "gostei",
                    createdAt: new Date()
                },
                {
                    id: "A2",
                    userId: USER_ID,
                    score: 1,
                    message: "não gostei",
                    createdAt: new Date()
                }
            ];

            prismaMock.avaliation.findMany.mockResolvedValue(avalsData as Avaliation[]);

            const avals = await avaliationRepository.findAllAvalsByUserId(USER_ID);

            expect(avals).toBe(avalsData);
            expect(prismaMock.avaliation.findMany).toHaveBeenCalledWith(
                {
                    where: { userId: USER_ID },
                    orderBy: { createdAt: "desc" },
                    include: {
                        user: {
                            select: { id: true, userName: true, email: true },
                        }
                    }
                }
            )
        })
    })
    describe("findAvalById", () => {
        it("Deve retornar uma avaliação com base no id fornecido", async () => {
            const avalData =
            {
                id: "A1",
                userId: "U1",
                score: 5,
                message: "gostei",
                createdAt: new Date()
            };


            prismaMock.avaliation.findUnique.mockResolvedValue(avalData)

            const aval = await avaliationRepository.findAvalById("A1");

            expect(aval).toBe(avalData);
            expect(prismaMock.avaliation.findUnique).toHaveBeenCalledWith({
                where: { id: "A1" },
                include: {
                    user: {
                        select: { id: true, userName: true, email: true },
                    }
                }
            })
        })
    })

    describe("createAval", () => {
        it("Deve criar e retornar uma avaliação", async () => {
            const mockAvalData: Prisma.AvaliationCreateInput = {
                score: 5,
                message: "gostei",
                user: {
                    connect: {
                        id: "U1"
                    }
                }
            }

            const createdAvalData: Avaliation = {
                id: "A1",
                userId: "U1",
                score: 5,
                message: "gostei",
                createdAt: new Date()
            }

            prismaMock.avaliation.create.mockResolvedValue(createdAvalData);

            const newAval = await avaliationRepository.createAval(mockAvalData, "U1")

            expect(newAval).toBe(createdAvalData);
            expect(prismaMock.avaliation.create).toHaveBeenCalledWith({
                data: {
                    ...mockAvalData,
                    user: {
                        connect:
                            { id: "U1" }
                    }
                },
                include: {
                    user: {
                        select: { id: true, userName: true, email: true },
                    }
                }
            })
        })
    })

    describe("updateAval", () => {
        it("Deve atualizar e retornar a avaliação selecionada", async () => {
            const mockAvalData: Prisma.AvaliationUpdateInput = {
                message: "gostei demais",
            }

            const updatedAvalData: Avaliation = {
                id: "A1",
                userId: "U1",
                score: 5,
                message: "gostei demais",
                createdAt: new Date()
            }

            prismaMock.avaliation.update.mockResolvedValue(updatedAvalData)

            const updatedAval = await avaliationRepository.updateAval("A1", mockAvalData)

            expect(updatedAval).toBe(updatedAvalData);
            expect(prismaMock.avaliation.update).toHaveBeenCalledWith({
                where: { id: "A1" },
                data: mockAvalData,
                include: {
                    user: {
                        select: { id: true, userName: true, email: true },
                    }
                }
            })
        })
    })

    describe("deleteAval", () => {
        it("Deve excluir uma avaliação e não retornar nada", async () => {
            prismaMock.avaliation.delete.mockResolvedValue({} as any)
            await avaliationRepository.deleteAval("A1");

            expect(prismaMock.avaliation.delete).toHaveBeenCalledWith({ where: { id: "A1" } })
        })
    })
})