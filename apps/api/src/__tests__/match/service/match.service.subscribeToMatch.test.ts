import matchService from "../../../modules/match/match.service";
import matchRepository from "../../../modules/match/match.repository";
import { ApiError } from "../../../utils/ApiError";
import httpStatus from "http-status";

jest.mock("../../../modules/match/match.repository");

const mockedRepo = matchRepository as jest.Mocked<typeof matchRepository>;

describe("MatchService.subscribeToMatch (Round Robin)", () => {
  const mockUserId = "user-uuid-123";
  const mockMatchId = "match-uuid-456";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve alocar no Time A (Round Robin) se A=0, B=0", async () => {
    const mockMatch = { id: mockMatchId, maxPlayers: 2, players: [] } as any;
    mockedRepo.findById.mockResolvedValue(mockMatch);
    mockedRepo.findSubscription.mockResolvedValue(null);

    await matchService.subscribeToMatch(mockMatchId, mockUserId);

    expect(mockedRepo.createSubscription).toHaveBeenCalledWith(
      mockUserId,
      mockMatchId,
      "A",
    );
  });

  it("deve alocar no Time B (Round Robin) se A=1, B=0", async () => {
    const mockMatch = {
      id: mockMatchId,
      maxPlayers: 2,
      players: [{ team: "A" }],
    } as any;
    mockedRepo.findById.mockResolvedValue(mockMatch);
    mockedRepo.findSubscription.mockResolvedValue(null);

    await matchService.subscribeToMatch(mockMatchId, mockUserId);

    expect(mockedRepo.createSubscription).toHaveBeenCalledWith(
      mockUserId,
      mockMatchId,
      "B",
    );
  });

  it("deve alocar no Time B se Time A estiver cheio", async () => {
    const mockMatch = {
      id: mockMatchId,
      maxPlayers: 2, // max=1 por time
      players: [{ team: "A" }], // A=1 (cheio), B=0
    } as any;
    mockedRepo.findById.mockResolvedValue(mockMatch);
    mockedRepo.findSubscription.mockResolvedValue(null);

    await matchService.subscribeToMatch(mockMatchId, mockUserId);

    expect(mockedRepo.createSubscription).toHaveBeenCalledWith(
      mockUserId,
      mockMatchId,
      "B",
    );
  });

  it("deve lançar 403 (Forbidden) se ambos os times estiverem cheios", async () => {
    const mockMatch = {
      id: mockMatchId,
      maxPlayers: 2, // max=1 por time
      players: [{ team: "A" }, { team: "B" }], // A=1 (cheio), B=1 (cheio)
    } as any;
    mockedRepo.findById.mockResolvedValue(mockMatch);
    mockedRepo.findSubscription.mockResolvedValue(null);

    await expect(
      matchService.subscribeToMatch(mockMatchId, mockUserId),
    ).rejects.toHaveProperty("statusCode", httpStatus.FORBIDDEN);
  });

  it("deve lançar 409 (Conflict) se o usuário já estiver inscrito", async () => {
    const mockMatch = {
      id: mockMatchId,
      maxPlayers: 10,
      players: [{ userId: mockUserId, team: "A" }], // Usuário já está aqui
    } as any;
    mockedRepo.findById.mockResolvedValue(mockMatch);
    // findSubscription não é chamado pois a checagem é feita no array 'players'

    await expect(
      matchService.subscribeToMatch(mockMatchId, mockUserId),
    ).rejects.toHaveProperty("statusCode", httpStatus.CONFLICT);
  });
});
