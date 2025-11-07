import matchService from "../../../modules/match/match.service";
import matchRepository from "../../../modules/match/match.repository";
import { ApiError } from "../../../utils/ApiError";
import httpStatus from "http-status";

jest.mock("../../../modules/match/match.repository");

const mockedRepo = matchRepository as jest.Mocked<typeof matchRepository>;

describe("MatchService.switchTeam", () => {
  const mockUserId = "user-uuid-123";
  const mockMatchId = "match-uuid-456";
  const mockSubscriptionId = "sub-uuid-789";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve trocar o usuário do Time A para o Time B com sucesso", async () => {
    const mockSubscription = { id: mockSubscriptionId, team: "A" } as any;
    mockedRepo.findSubscription.mockResolvedValue(mockSubscription);

    const mockMatch = {
      id: mockMatchId,
      maxPlayers: 2, // max=1 por time
      players: [mockSubscription], // A=1, B=0
    } as any;
    mockedRepo.findById.mockResolvedValue(mockMatch);

    await matchService.switchTeam(mockMatchId, mockUserId);

    expect(mockedRepo.updateSubscriptionTeam).toHaveBeenCalledWith(
      mockSubscriptionId,
      "B",
    );
  });

  it("deve trocar o usuário do Time B para o Time A com sucesso", async () => {
    const mockSubscription = { id: mockSubscriptionId, team: "B" } as any;
    mockedRepo.findSubscription.mockResolvedValue(mockSubscription);

    const mockMatch = {
      id: mockMatchId,
      maxPlayers: 2,
      players: [mockSubscription], // A=0, B=1
    } as any;
    mockedRepo.findById.mockResolvedValue(mockMatch);

    await matchService.switchTeam(mockMatchId, mockUserId);

    expect(mockedRepo.updateSubscriptionTeam).toHaveBeenCalledWith(
      mockSubscriptionId,
      "A",
    );
  });

  it("deve lançar 403 (Forbidden) se o novo time (B) estiver cheio", async () => {
    const mockSubscription = {
      id: mockSubscriptionId,
      team: "A",
      userId: mockUserId,
    } as any;
    mockedRepo.findSubscription.mockResolvedValue(mockSubscription);

    const mockMatch = {
      id: mockMatchId,
      maxPlayers: 2, // max=1 por time
      players: [
        mockSubscription, // User A (team A)
        { id: "sub-2", team: "B", userId: "other-user" }, // User B (team B)
      ],
    } as any;
    mockedRepo.findById.mockResolvedValue(mockMatch); // B está cheio

    await expect(
      matchService.switchTeam(mockMatchId, mockUserId),
    ).rejects.toHaveProperty("statusCode", httpStatus.FORBIDDEN);
  });

  it("deve lançar 404 (Not Found) se o usuário não estiver inscrito", async () => {
    mockedRepo.findSubscription.mockResolvedValue(null);

    await expect(
      matchService.switchTeam(mockMatchId, mockUserId),
    ).rejects.toHaveProperty("statusCode", httpStatus.NOT_FOUND);
  });
});
