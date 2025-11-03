import matchService from "../../modules/match/match.service";
import matchRepository from "../../modules/match/match.repository";

jest.mock("../../modules/match/match.repository");

const mockedRepo = matchRepository as jest.Mocked<typeof matchRepository>;

describe("MatchService.getAllMatches (CA1)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar todas as partidas com os campos de spots calculados", async () => {
    const mockMatches = [
      { id: "uuid-1", maxPlayers: 10, _count: { players: 5 } },
      { id: "uuid-2", maxPlayers: 2, _count: { players: 2 } },
    ] as any;

    mockedRepo.findAll.mockResolvedValue(mockMatches);

    const result = await matchService.getAllMatches();

    expect(result).toHaveLength(2);
    expect(result[0]!.spots.filled).toBe(5);
    expect(result[0]!.spots.open).toBe(5);
    expect(result[0]!.isSubscriptionOpen).toBe(true);
    expect(result[1]!.spots.filled).toBe(2);
    expect(result[1]!.spots.open).toBe(0);
    expect(result[1]!.isSubscriptionOpen).toBe(false);
  });
});
