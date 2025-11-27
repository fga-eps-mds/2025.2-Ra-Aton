import matchService from "../../../modules/match/match.service";
import matchRepository from "../../../modules/match/match.repository";
import { ApiError } from "../../../utils/ApiError";
import httpStatus from "http-status";
import { MatchStatus } from "@prisma/client";
import { mock } from "jest-mock-extended";

jest.mock("../../../modules/match/match.repository");

const mockedRepo = matchRepository as jest.Mocked<typeof matchRepository>;

describe("MatchService.createMatch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar uma partida com sucesso", async () => {
    // 1. ARRANGE
    const mockData = {
      title: "Partida de Teste",
      date: new Date(),
      maxPlayers: 4,
      location: "Local de Teste",
      sport: "futsal",
      description: "Descrição de Teste",
      teamNameA: "Time A",
      teamAScore: 3,
      teamNameB: "Updatable Team B",
      teamBScore: 2,
      author: {
        id: "1",
      },
    };

    const repo = jest.mocked(matchRepository);

    const createdMatch = {
      MatchDate: mockData.date,
      id: "m_1",
      createdAt: new Date(),
      updatedAt: new Date(),
      title: mockData.title,
      description: mockData.description,
      teamNameA: mockData.teamNameA,
      teamAScore: mockData.teamAScore,
      teamNameB: mockData.teamNameB,
      teamBScore: mockData.teamBScore,
      authorId: mockData.author.id,
      maxPlayers: mockData.maxPlayers,
      MatchStatus: MatchStatus.EM_BREVE,
      location: mockData.location,
      sport: mockData.sport,
    };

    repo.createMatch.mockResolvedValue(createdMatch);

    // 2. ACT
    const result = await matchService.createMatch(mockData);

    // 3. ASSERT
    expect(result).toBeDefined();
    expect(repo.createMatch).toHaveBeenCalledWith(mockData, mockData.author);
    expect(repo.createMatch).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject(createdMatch);
  });

  it("deve lancar um erro se o autor nao for passado na partida", async () => {
    // 1. ARRANGE
    const mockData = {
      title: "Partida de Teste",
      date: new Date(),
      maxPlayers: 4,
    };

    // 2. ACT & ASSERT
    await expect(matchService.createMatch(mockData)).rejects.toThrow(
      new ApiError(httpStatus.NOT_FOUND, "Autor da partida não encontrado"),
    );
  });
});
