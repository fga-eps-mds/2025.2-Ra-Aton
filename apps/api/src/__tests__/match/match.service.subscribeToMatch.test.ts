import matchService from "../../modules/match/match.service";
import matchRepository, {
  MatchWithPlayers,
} from "../../modules/match/match.repository";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import { PlayerSubscription } from "@prisma/client";

jest.mock("../../modules/match/match.repository");

const mockedRepo = matchRepository as jest.Mocked<typeof matchRepository>;

describe("MatchService.subscribeToMatch (CA2)", () => {
  const mockUserId = "user-uuid-123";
  const mockMatchId = "match-uuid-456";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve inscrever um usuário com sucesso", async () => {
    const mockMatch = {
      id: mockMatchId,
      maxPlayers: 10,
      players: [],
    } as unknown as MatchWithPlayers;

    mockedRepo.findById.mockResolvedValue(mockMatch);
    mockedRepo.findSubscription.mockResolvedValue(null);

    await matchService.subscribeToMatch(mockMatchId, mockUserId);

    expect(mockedRepo.createSubscription).toHaveBeenCalledTimes(1);
    expect(mockedRepo.createSubscription).toHaveBeenCalledWith(
      mockUserId,
      mockMatchId,
    );
  });

  it("deve lançar um erro 409 (Conflict) se o usuário já estiver inscrito", async () => {
    const mockMatch = { id: mockMatchId, maxPlayers: 10, players: [] } as any;
    const mockSubscription = { id: "sub-uuid-1" } as PlayerSubscription;

    mockedRepo.findById.mockResolvedValue(mockMatch);
    mockedRepo.findSubscription.mockResolvedValue(mockSubscription);

    expect.assertions(2);
    try {
      await matchService.subscribeToMatch(mockMatchId, mockUserId);
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).statusCode).toBe(httpStatus.CONFLICT);
    }
  });

  it("deve lançar um erro 403 (Forbidden) se a partida estiver cheia", async () => {
    const mockMatch = {
      id: mockMatchId,
      maxPlayers: 1,
      players: [{ id: "sub-1", user: { id: "user-outro" } }],
    } as unknown as MatchWithPlayers;

    mockedRepo.findById.mockResolvedValue(mockMatch);
    mockedRepo.findSubscription.mockResolvedValue(null);

    await expect(
      matchService.subscribeToMatch(mockMatchId, mockUserId),
    ).rejects.toHaveProperty("statusCode", httpStatus.FORBIDDEN);
  });

  it("deve lançar um erro 404 (Not Found) se a partida não existir", async () => {
    mockedRepo.findById.mockResolvedValue(null);

    await expect(
      matchService.subscribeToMatch(mockMatchId, mockUserId),
    ).rejects.toHaveProperty("statusCode", httpStatus.NOT_FOUND);
  });
});
