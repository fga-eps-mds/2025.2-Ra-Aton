import { Response, Request } from "express";
import { ApiError } from "../../utils/ApiError";
import { matchService } from "./match.service";
import { userService } from "../user/user.service";
import HttpStatus from "http-status";

class matchController {
  async listAllMatchs(req: Request, res: Response) {
    const matchs = await matchService.listAllMatchs();
    res.status(HttpStatus.OK).json(matchs);
  }

  async getMatch(req: Request, res: Response) {
    const matchId = req.params.id;
    if (!matchId) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: "Id da partida é obrigatorio para continuar",
      });
    }
    const match = await matchService.getMatchById(matchId);
    res.status(HttpStatus.OK).json(match);
  }

  async createMatch(req: Request, res: Response) {
    const authUser = (req as any).user;
    if (!authUser || authUser.id) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "Não foi possivel autorizar o usuário" });
    }

    const author = await userService.getUserById(authUser.id);
    if (!author) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: "Usuário autor não encontrado" });
    }

    const data = {
      ...req.body,
      author: author,
    };
    
    const newMatch = await matchService.createMatch(data);
    if (!newMatch) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: "Erro ao criar partida." });
    }

    return res.status(HttpStatus.CREATED).json(newMatch);
  }

  async updateMatch(req: Request, res: Response) {
    const authUser = (req as any).user;
    if (!authUser || authUser.id) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "Não foi possivel autorizar o usuário" });
    }

    const matchId = req.params.id;
    if (!matchId) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: "Id da partida é obrigatorio para continuar",
      });
    }

    try {
      const updatedMatch = await matchService.updateMatch(
        matchId,
        authUser.id,
        req.body,
      );
      return res.status(HttpStatus.OK).json(updatedMatch);
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Erro ao atualizar partida" });
    }
  }

  async deleteMatch(req: Request, res: Response) {
    const authUser = (req as any).user;
    if (!authUser || authUser.id) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "Não foi possivel autorizar o usuário" });
    }

    const matchId = req.params.id;
    if (!matchId) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: "Id da partida é obrigatorio para continuar",
      });
    }
    try {
      await matchService.deleteMatch(matchId, authUser.id);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Erro ao deletar partida" });
    }
  }
}

export default new matchController();
