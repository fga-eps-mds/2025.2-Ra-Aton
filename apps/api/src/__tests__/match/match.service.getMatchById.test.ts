import matchService from "../../modules/match/match.service";
import matchRepository, {
  MatchWithPlayers,
} from "../../modules/match/match.repository";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

jest.mock("../../modules/match/match.repository");

const mockedRepo = matchRepository as jest.Mocked<typeof matchRepository>;

describe("MatchService.getMatchById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar a partida formatada com times A e B e nomes customizados", async () => {
    const mockMatch = {
      id: "uuid-1",
      maxPlayers: 2, // teamMaxSize = 1
      teamNameA: "Camisas",
      teamNameB: "Peles",
      players: [
        { id: "sub-1", team: "A", user: { id: "user-1", userName: "usera" } },
      ],
    } as unknown as MatchWithPlayers;

    mockedRepo.findById.mockResolvedValue(mockMatch);

    const result = await matchService.getMatchById("uuid-1");

    expect(result.id).toBe("uuid-1");
    expect(result.teamA.name).toBe("Camisas");
    expect(result.teamA.filled).toBe(1);
    expect(result.teamA.isOpen).toBe(false); // max=1, filled=1
    expect(result.teamA.players[0]!.userName).toBe("usera");

    expect(result.teamB.name).toBe("Peles");
    expect(result.teamB.filled).toBe(0);
    expect(result.teamB.isOpen).toBe(true); // max=1, filled=0

    expect(result.isSubscriptionOpen).toBe(true); // Pode inscrever (Time B está aberto)
  });

  it("deve lançar um erro 404 se a partida não for encontrada", async () => {
    mockedRepo.findById.mockResolvedValue(null);

    await expect(matchService.getMatchById("uuid-nao-existe")).rejects.toThrow(
      ApiError,
    );

    await expect(
      matchService.getMatchById("uuid-nao-existe"),
    ).rejects.toHaveProperty("statusCode", httpStatus.NOT_FOUND);
  });
});
