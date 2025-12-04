import matchService from "../../../modules/match/match.service";
import matchRepository from "../../../modules/match/match.repository";
import { ApiError } from "../../../utils/ApiError";
import httpStatus from "http-status";

jest.mock("../../../modules/match/match.repository");

describe("matchService.updateMatch", () => {
  const mockMatchId = "match-id-123";
  const mockAuthUserId = "user-id-456";
  const mockMatchData = {
    title: "Updated Match Title",
    description: "Updated Description",
    MatchDate: new Date(),
    teamNameA: "Updated Team A",
    teamAScore: 3,
    teamNameB: "Updatable Team B",
    teamBScore: 2,
    location: "Updated Location",
    sport: "futsal",
    maxPlayers: 20,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should update match successfully when user is the author", async () => {
    // Arrange
    const mockMatchFound = {
      id: mockMatchId,
      authorId: mockAuthUserId,
    };

    const mockUpdatedMatch = {
      ...mockMatchFound,
      ...mockMatchData,
    };

    (matchRepository.findById as jest.Mock).mockResolvedValue(mockMatchFound);
    (matchRepository.updateMatch as jest.Mock).mockResolvedValue(
      mockUpdatedMatch,
    );

    // Act
    const result = await matchService.updateMatch(
      mockMatchId,
      mockAuthUserId,
      mockMatchData,
    );

    // Assert
    expect(matchRepository.findById).toHaveBeenCalledWith(mockMatchId);
    expect(matchRepository.updateMatch).toHaveBeenCalledWith(
      mockMatchId,
      mockMatchData,
    );
    expect(result).toEqual(mockUpdatedMatch);
  });

  it("should throw NOT_FOUND error when match does not exist", async () => {
    (matchRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      matchService.updateMatch(mockMatchId, mockAuthUserId, mockMatchData),
    ).rejects.toThrow(
      new ApiError(httpStatus.NOT_FOUND, "Partida não encontrada"),
    );

    expect(matchRepository.findById).toHaveBeenCalledWith(mockMatchId);
    expect(matchRepository.updateMatch).not.toHaveBeenCalled();
  });

  it("should throw FORBIDDEN error when user is not the author", async () => {
    const mockMatchFound = {
      id: mockMatchId,
      authorId: "other-user-id",
    };

    (matchRepository.findById as jest.Mock).mockResolvedValue(mockMatchFound);

    await expect(
      matchService.updateMatch(mockMatchId, mockAuthUserId, mockMatchData),
    ).rejects.toThrow(
      new ApiError(
        httpStatus.FORBIDDEN,
        "Usuário não possui permisão para editar partida",
      ),
    );

    expect(matchRepository.findById).toHaveBeenCalledWith(mockMatchId);
    expect(matchRepository.updateMatch).not.toHaveBeenCalled();
  });
});
