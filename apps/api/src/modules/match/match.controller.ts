import { Response, Request } from "express";
import { ApiError } from "../../utils/ApiError";
import matchService from "./match.service";
import { userService } from "../user/user.service";
import HttpStatus from "http-status";

class matchController {
  async createMatch(req: Request, res: Response) {
    const authUser = (req as any).body.userId;
    if (!authUser) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "Não foi possivel autorizar o usuário" });
    }

    const author = await userService.getUserById(authUser);
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
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Erro ao criar partida." });
    }

    return res.status(HttpStatus.CREATED).json(newMatch);
  }

  async updateMatch(req: Request, res: Response) {
    const authUser = (req as any).user;
    if (!authUser || !authUser.id) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "Não foi possivel autorizar o usuário" });
    }

    if (!req.params || !req.params.id) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: "Id da partida é obrigatorio para continuar",
      });
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
    if (!authUser || !authUser.id) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "Não foi possivel autorizar o usuário" });
    }

    if (!req.params || !req.params.id) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: "Id da partida é obrigatorio para continuar",
      });
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

  async listMatches(req: Request, res: Response) {
    const DEFAULT_PAGE_LIMIT = 10;
    const DEFAULT_PAGE = 1;

    const limit = parseInt(req.query.limit as string, 10);
    const page = parseInt(req.query.page as string, 10);

    const safeLimit = isNaN(limit) ? DEFAULT_PAGE_LIMIT : limit;
    const safePage = isNaN(page) ? DEFAULT_PAGE : page;
    if (safeLimit > 50) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "O limite não pode ser maior que 50",
      );
    }
    const paginatedResult = await matchService.getAllMatches(
      safeLimit,
      safePage,
    );
    res.status(HttpStatus.OK).json(paginatedResult);
  }

  async listMatchesByUserId(req: Request, res: Response) {
    const authUser = (req as any).user;
    if (!authUser || !authUser.id) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Usuário não está logado corretamente"})
    }
    const matches = await matchService.getAllMatchesByUserId(authUser.id);
    res.status(HttpStatus.OK).json(matches);
  }

  async getMatch(req: Request, res: Response) {
    const { id } = req.params;

    const match = await matchService.getMatchById(id!);
    res.status(HttpStatus.OK).json(match);
  }

  async subscribeToMatch(req: Request, res: Response) {
    const { id: matchId } = req.params;
    const { id: userId } = (req as any).user!;

    await matchService.subscribeToMatch(matchId!, userId);
    res
      .status(HttpStatus.CREATED)
      .json({ message: "Inscrição realizada com sucesso" });
  }

  async unsubscribeFromMatch(req: Request, res: Response) {
    const { id: matchId } = req.params;
    const { id: userId } = (req as any).user!;

    await matchService.unsubscribeFromMatch(matchId!, userId);
    res
      .status(HttpStatus.OK)
      .json({ message: "Inscrição cancelada com sucesso" });
  }

  async switchTeam(req: Request, res: Response) {
    const { id: matchId } = req.params;
    const { id: userId } = (req as any).user!;

    await matchService.switchTeam(matchId!, userId);
    res
      .status(HttpStatus.OK)
      .json({ message: "Troca de time realizada com sucesso" });
  }
}

export default new matchController();
