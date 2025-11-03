import { Request, Response } from "express";
import matchService from "./match.service";
import httpStatus from "http-status";

class MatchController {
  async listMatches(req: Request, res: Response) {
    const matches = await matchService.getAllMatches();
    res.status(httpStatus.OK).json(matches);
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
}

export default new MatchController();
