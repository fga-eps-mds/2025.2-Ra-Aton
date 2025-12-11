import { Request, Response } from "express";
import avaliationService from "./avaliation.service";
import HttpStatus from "http-status";
import { ApiError } from "../../utils/ApiError";

class AvaliationController {
    async findAllAvals(req: Request, res: Response) {
        const avals = await avaliationService.findAllAvals();
        return res.status(HttpStatus.OK).json(avals);
    }

    async findAllAvalsByUserId(req: Request, res: Response) {
        const authUser = (req as any).user;
        if (!authUser || !authUser.id) {
            return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Usuário não está autenticado" })
        }

        const avals = await avaliationService.findAllAvalsByUserId(authUser.id);
        return res.status(HttpStatus.OK).json(avals);;
    }

    async findAvalById(req: Request, res: Response) {
        const { id } = req.params;
        if (!id) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "O id da avaliação não foi recebido corretamente" })
        }

        const aval = await avaliationService.findAvalById(id);
        return res.status(HttpStatus.FOUND).json(aval);
    }

    async createAval(req: Request, res: Response) {
        const authUser = (req as any).user;
        if (!authUser || !authUser.id) {
            return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Usuário não está autenticado" })
        }

        const data = req.body;
        const newAval = await avaliationService.createAval(data, authUser.id);
        return res.status(HttpStatus.CREATED).json(newAval);
    }

    async updateAval(req: Request, res: Response) {
        const { id } = req.params;
        const data = req.body;
        if (!id) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "O id da avaliação não foi recebido corretamente" })
        }

        try {
            const updatedAval = await avaliationService.updateAval(data, id);
            return res.status(HttpStatus.OK).json(updatedAval);
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({ message: error.message })
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Erro interno do servidor" })
        }
    }

    async deleteAval(req: Request, res: Response) {
        const { id } = req.params;
        if (!id) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "O id da avaliação não foi recebido corretamente" })
        }

        try {
            await avaliationService.deleteAval(id);
            return res.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({ message: error.message })
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Erro interno do servidor" })
        }
    }
}

export default new AvaliationController();