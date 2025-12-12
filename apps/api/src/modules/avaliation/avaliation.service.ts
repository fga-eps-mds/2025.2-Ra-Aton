import { Avaliation } from "@prisma/client"
import AvaliationRepository from "./avaliation.repository"
import { ApiError } from "../../utils/ApiError"
import HttpStatus from "http-status"
import avaliationRepository from "./avaliation.repository"

class AvaliationService {
    findAllAvals = async (): Promise<Avaliation[]> => {
        const avals = await AvaliationRepository.findAllAvals();
        return avals.map((aval) => {
            return aval;
        })
    }

    findAllAvalsByUserId = async (userId: string): Promise<Avaliation[]> => {
        const avals = await AvaliationRepository.findAllAvalsByUserId(userId);
        return avals.map((aval) => {
            return aval;
        })
    }

    findAvalById = async (id: string): Promise<Avaliation> => {
        const aval = await AvaliationRepository.findAvalById(id);
        if (!aval) {
            throw new ApiError(
                HttpStatus.NOT_FOUND,
                "Avalição não foi encontrada"
            )
        }
        return aval;
    }

    createAval = async (data: any, userId: string | undefined): Promise<Avaliation> => {
        if (!userId) {
            throw new ApiError(
                HttpStatus.BAD_REQUEST,
                "Id do usuário não foi recebido corretamente"
            )
        }

        if (data.score > 5 || data.score < 0) {
            throw new ApiError(
                HttpStatus.BAD_REQUEST,
                "A pontuação precisa ser um valor entre 0 e 5"
            )
        }

        const newAval = AvaliationRepository.createAval(data, userId)
        return newAval;
    }

    updateAval = async (data: any, id: string | null): Promise<Avaliation> => {
        if (!id) {
            throw new ApiError(
                HttpStatus.BAD_REQUEST,
                "O id da avaliação não foi recebido corretamente"
            )
        }
        const updatedAval = await avaliationRepository.updateAval(id, data);
        return updatedAval;
    }

    deleteAval = async (id: string | null): Promise<void> => {
        if (!id) {
            throw new ApiError(
                HttpStatus.BAD_REQUEST,
                "O id da avaliação não for recebido corretamente"
            )
        }
        await avaliationRepository.deleteAval(id);
    } 
}

export default new AvaliationService();