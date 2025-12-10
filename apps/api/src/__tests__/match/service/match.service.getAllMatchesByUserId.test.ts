import matchService from "../../../modules/match/match.service";
import matchRepository from "../../../modules/match/match.repository";

jest.mock("../../../modules/match/match.repository");

describe("MatchService.getAllMatchesByUserId", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("Deve retornar uma lista com todas as partidas que o usuário logado for autor", async () => {
        const matches = [
            {
                userId: "author-id",
                title: "Match 1",
                description: "Description for Match 1",
                MatchDate: new Date(),
                teamNameA: "Team A",
                teamNameB: "Team B",
                location: "Stadium A",
                maxPlayers: 22,
            },
            {
                userId: "author-id",
                title: "Match 2",
                description: "Description for Match 2",
                MatchDate: new Date(),
                teamNameA: "Team A",
                teamNameB: "Team B",
                location: "Stadium A",
                maxPlayers: 22,
            }
        ];

        (matchRepository.findAllMatchesByUserId as jest.Mock).mockResolvedValue(matches);

        const matchesFound = await matchService.getAllMatchesByUserId("author-id");
        expect(matchesFound).toEqual(matches);
        expect(matchRepository.findAllMatchesByUserId).toHaveBeenCalledWith("author-id");
    })
});