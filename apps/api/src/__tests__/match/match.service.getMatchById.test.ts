import matchService from "../../modules/match/match.service";
import matchRepository, {
  MatchWithPlayers,
} from "../../modules/match/match.repository";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import { MatchStatus } from "@prisma/client";

jest.mock("../../modules/match/match.repository");

const mockedRepo = matchRepository as jest.Mocked<typeof matchRepository>;

// Define a data atual "falsa" para os testes de status
const MOCK_NOW = new Date("2025-10-30T10:00:00.000Z"); // 10:00 UTC
const MOCK_PAST = new Date("2025-10-30T09:00:00.000Z"); // 09:00 UTC
const MOCK_FUTURE = new Date("2025-10-30T11:00:00.000Z"); // 11:00 UTC

describe("MatchService.getMatchById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(MOCK_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("deve retornar a partida com status EM_BREVE (data no futuro)", async () => {
    const mockMatch = {
      id: "uuid-1",
      maxPlayers: 2,
      teamNameA: "A",
      teamNameB: "B",
      players: [],
      MatchDate: MOCK_FUTURE,
      MatchStatus: MatchStatus.EM_BREVE,
    } as unknown as MatchWithPlayers;

    mockedRepo.findById.mockResolvedValue(mockMatch);
    const result = await matchService.getMatchById("uuid-1");
    expect(result.MatchStatus).toBe(MatchStatus.EM_BREVE);
  });

  it("deve retornar a partida com status EM_ANDAMENTO (data no passado)", async () => {
    const mockMatch = {
      id: "uuid-1",
      maxPlayers: 2,
      teamNameA: "A",
      teamNameB: "B",
      players: [],
      MatchDate: MOCK_PAST, // <-- Partida já começou
      MatchStatus: MatchStatus.EM_BREVE, // <-- Banco está "atrasado"
    } as unknown as MatchWithPlayers;

    mockedRepo.findById.mockResolvedValue(mockMatch);
    const result = await matchService.getMatchById("uuid-1");
    expect(result.MatchStatus).toBe(MatchStatus.EM_ANDAMENTO);
  });

  it("deve retornar a partida com status FINALIZADO (data no passado)", async () => {
    const mockMatch = {
      id: "uuid-1",
      maxPlayers: 2,
      teamNameA: "A",
      teamNameB: "B",
      players: [],
      MatchDate: MOCK_PAST, // <-- Partida no passado
      MatchStatus: MatchStatus.FINALIZADO, // <-- Banco já está finalizado
    } as unknown as MatchWithPlayers;

    mockedRepo.findById.mockResolvedValue(mockMatch);
    const result = await matchService.getMatchById("uuid-1");
    expect(result.MatchStatus).toBe(MatchStatus.FINALIZADO);
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
