import matchService from "../../modules/match/match.service";
import matchRepository, {
  MatchWithPlayers,
} from "../../modules/match/match.repository";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

jest.mock("../../modules/match/match.repository");

const mockedRepo = matchRepository as jest.Mocked<typeof matchRepository>;

describe("MatchService.getMatchById (CA1)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar uma partida formatada com lista de jogadores", async () => {
    const mockMatch = {
      id: "uuid-1",
      maxPlayers: 10,
      players: [{ id: "sub-1", user: { id: "user-1", userName: "testuser" } }],
    } as unknown as MatchWithPlayers;

    mockedRepo.findById.mockResolvedValue(mockMatch);

    const result = await matchService.getMatchById("uuid-1");

    expect(result.id).toBe("uuid-1");
    expect(result.spots.filled).toBe(1);
    expect(result.spots.open).toBe(9);
    expect(result.players).toHaveLength(1);
    expect(result.players[0].user.userName).toBe("testuser");
  });

  it("deve lançar um erro 404 (ApiError) se a partida não for encontrada", async () => {
    mockedRepo.findById.mockResolvedValue(null);

    await expect(matchService.getMatchById("uuid-nao-existe")).rejects.toThrow(
      ApiError,
    );

    await expect(
      matchService.getMatchById("uuid-nao-existe"),
    ).rejects.toHaveProperty("statusCode", httpStatus.NOT_FOUND);
  });
});
