import { Request, Response } from "express";
import matchService from "./match.service";
import httpStatus from "http-status";
import { ApiError } from "../../utils/ApiError";
class MatchController {
  async listMatches(req: Request, res: Response) {
    const DEFAULT_PAGE_LIMIT = 10;
    const DEFAULT_PAGE = 1;

    const limit = parseInt(req.query.limit as string, 10);
    const page = parseInt(req.query.page as string, 10);

    const safeLimit = isNaN(limit) ? DEFAULT_PAGE_LIMIT : limit;
    const safePage = isNaN(page) ? DEFAULT_PAGE : page;
    if (safeLimit > 50) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "O limite não pode ser maior que 50",
      );
    }
    const paginatedResult = await matchService.getAllMatches(
      safeLimit,
      safePage,
    );
    res.status(httpStatus.OK).json(paginatedResult);
  }

  async getMatch(req: Request, res: Response) {
    const { id } = req.params;

    const match = await matchService.getMatchById(id!);
    res.status(httpStatus.OK).json(match);
  }

  async subscribeToMatch(req: Request, res: Response) {
    const { id: matchId } = req.params;
    const { id: userId } = (req as any).user!;

    await matchService.subscribeToMatch(matchId!, userId);
    res
      .status(httpStatus.CREATED)
      .json({ message: "Inscrição realizada com sucesso" });
  }

  async unsubscribeFromMatch(req: Request, res: Response) {
    const { id: matchId } = req.params;
    const { id: userId } = (req as any).user!;

    await matchService.unsubscribeFromMatch(matchId!, userId);
    res
      .status(httpStatus.OK)
      .json({ message: "Inscrição cancelada com sucesso" });
  }

  async switchTeam(req: Request, res: Response) {
    const { id: matchId } = req.params;
    const { id: userId } = (req as any).user!;

    await matchService.switchTeam(matchId!, userId);
    res
      .status(httpStatus.OK)
      .json({ message: "Troca de time realizada com sucesso" });
  }
}

export default new MatchController();
