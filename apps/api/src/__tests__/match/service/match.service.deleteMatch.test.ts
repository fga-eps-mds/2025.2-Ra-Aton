import MatchService from "../../../modules/match/match.service";
import matchRepository from "../../../modules/match/match.repository";
import { ApiError } from "../../../utils/ApiError";
import httpStatus from "http-status";
import { MatchStatus } from "@prisma/client/wasm";

jest.mock("../../../modules/match/match.repository");

describe("MatchService.deleteMatch", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("deve deletar uma partida com sucesso", async () => {
    // 1. ARRANGE
    const matchId = "m_1";
    const authorId = "user_1";

    const repo = jest.mocked(matchRepository);

    const deletedMatch = {
        id: matchId,
        authorId: authorId,
        title: "Deleted Match",
        description: "This match has been deleted",
        MatchDate: new Date(),
        teamNameA: "Team A",
        teamAScore: 3,
        teamNameB: "Updatable Team B",
        teamBScore: 2,
        location: "Stadium A",
        sport: "futsal",
        maxPlayers: 22,
        players: [],
        MatchStatus: MatchStatus.FINALIZADO,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    repo.findById.mockResolvedValue({ ...deletedMatch, reminderSent: false });
    repo.deleteMatch.mockResolvedValue({ ...deletedMatch, reminderSent: false });

    // 2. ACT
    const result = await MatchService.deleteMatch(matchId, authorId);

    // 3. ASSERT
    expect(repo.deleteMatch).toHaveBeenCalledTimes(1);
    expect(repo.deleteMatch).toHaveBeenCalledWith(matchId);
    expect(result).toBe(undefined); 
    // Não retorna nada em caso de sucesso apenas o controller deveolve 204 No Content
  });

  it("deve lancar um erro se a partida nao for encontrada", async () => {
    // 1. ARRANGE
    const matchId = "m_nonexistent";
    const authorId = "user_1";

    const repo = jest.mocked(matchRepository);

    repo.findById.mockResolvedValue(null);

    // 2. ACT & ASSERT
    await expect(MatchService.deleteMatch(matchId, authorId)).rejects.toThrow(
      new ApiError(httpStatus.NOT_FOUND, "Partida não encontrada"),
    );

    expect(repo.deleteMatch).not.toHaveBeenCalled();
  });
})