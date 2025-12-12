import { prisma } from "../../database/prisma.client"
import { Prisma, Avaliation } from "@prisma/client"

class AvaliationRepository {
    async findAllAvals(): Promise<Avaliation[]> {
        return prisma.avaliation.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: { id: true, userName: true, email: true },
                }
            }
        })
    }

    async findAllAvalsByUserId(userId: string): Promise<Avaliation[]> {
        return prisma.avaliation.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: { id: true, userName: true, email: true },
                }
            }
        })
    }

    async findAvalById(id: string): Promise<Avaliation | null> {
        return prisma.avaliation.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, userName: true, email: true },
                }
            }
        })
    }

    async createAval(data: Prisma.AvaliationCreateInput, userId: string): Promise<Avaliation> {
        return prisma.avaliation.create({
            data: {
                ...data,
                user: {
                    connect:
                        { id: userId }
                }
            },
            include: {
                user: {
                    select: { id: true, userName: true, email: true },
                }
            }
        })
    }

    async updateAval(id: string, data: Prisma.AvaliationUpdateInput): Promise<Avaliation> {
        return prisma.avaliation.update({
            where: { id },
            data,
            include: {
                user: {
                    select: { id: true, userName: true, email: true },
                }
            }
        })
    }

    async deleteAval(id: string): Promise<void> {
        await prisma.avaliation.delete({ where: { id } })
    }
}

export default new AvaliationRepository();