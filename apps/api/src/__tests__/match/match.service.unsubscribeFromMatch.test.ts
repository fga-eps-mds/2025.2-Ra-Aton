import matchService from "../../modules/match/match.service";
import matchRepository from "../../modules/match/match.repository";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import { PlayerSubscription } from "@prisma/client";

jest.mock("../../modules/match/match.repository");

const mockedRepo = matchRepository as jest.Mocked<typeof matchRepository>;

describe("MatchService.unsubscribeFromMatch (CA3)", () => {
  const mockUserId = "user-uuid-123";
  const mockMatchId = "match-uuid-456";
  const mockSubscriptionId = "sub-uuid-789";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve cancelar a inscrição de um usuário com sucesso", async () => {
    const mockSubscription = {
      id: mockSubscriptionId,
      userId: mockUserId,
      matchId: mockMatchId,
    } as PlayerSubscription;

    mockedRepo.findSubscription.mockResolvedValue(mockSubscription);

    await matchService.unsubscribeFromMatch(mockMatchId, mockUserId);

    expect(mockedRepo.deleteSubscription).toHaveBeenCalledTimes(1);
    expect(mockedRepo.deleteSubscription).toHaveBeenCalledWith(
      mockSubscriptionId,
    );
  });

  it("deve lançar um erro 404 (Not Found) se o usuário não estiver inscrito", async () => {
    mockedRepo.findSubscription.mockResolvedValue(null);

    await expect(
      matchService.unsubscribeFromMatch(mockMatchId, mockUserId),
    ).rejects.toHaveProperty("statusCode", httpStatus.NOT_FOUND);

    expect(mockedRepo.deleteSubscription).not.toHaveBeenCalled();
  });
});
