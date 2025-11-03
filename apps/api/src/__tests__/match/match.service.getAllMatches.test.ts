import matchService from "../../modules/match/match.service";
import matchRepository from "../../modules/match/match.repository";
import { MatchStatus } from "@prisma/client";

jest.mock("../../modules/match/match.repository");

const mockedRepo = matchRepository as jest.Mocked<typeof matchRepository>;

// Define a data atual "falsa" para os testes de status
const MOCK_NOW = new Date("2025-10-30T10:00:00.000Z"); // 10:00 UTC
const MOCK_PAST = new Date("2025-10-30T09:00:00.000Z"); // 09:00 UTC
const MOCK_FUTURE = new Date("2025-10-30T11:00:00.000Z"); // 11:00 UTC

describe("MatchService.getAllMatches (Limit/Offset)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Configura o relógio do Jest para mockar new Date()
    jest.useFakeTimers().setSystemTime(MOCK_NOW);
  });

  afterEach(() => {
    jest.useRealTimers(); // Retorna ao relógio real
  });

  it("deve retornar a primeira página de partidas com metadados corretos", async () => {
    // 1. ARRANGE
    const mockMatches = [
      {
        id: "uuid-1",
        maxPlayers: 10,
        _count: { players: 5 },
        MatchDate: MOCK_FUTURE,
        MatchStatus: MatchStatus.EM_BREVE,
      },
      {
        id: "uuid-2",
        maxPlayers: 2,
        _count: { players: 2 },
        MatchDate: MOCK_FUTURE,
        MatchStatus: MatchStatus.EM_BREVE,
      },
    ] as any;

    // Simula o retorno do repositório (2 partidas, 20 no total)
    mockedRepo.findAll.mockResolvedValue({
      matches: mockMatches,
      totalCount: 20,
    });

    // 2. ACT (Testando page=1, limit=10)
    const result = await matchService.getAllMatches(10, 1);

    // 3. ASSERT
    expect(mockedRepo.findAll).toHaveBeenCalledWith(10, 0); // limit=10, offset=0
    expect(result.data).toHaveLength(2);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
    expect(result.meta.totalCount).toBe(20);
    expect(result.meta.totalPages).toBe(2); // 20 / 10 = 2
    expect(result.meta.hasNextPage).toBe(true);
    expect(result.meta.hasPrevPage).toBe(false);
  });

  it("deve calcular o status dinâmico (EM_ANDAMENTO)", async () => {
    const mockMatches = [
      {
        id: "uuid-1",
        maxPlayers: 10,
        _count: { players: 5 },
        MatchDate: MOCK_PAST, // Data da partida está no passado
        MatchStatus: MatchStatus.EM_BREVE, // Status do banco está "atrasado"
      },
    ] as any;

    mockedRepo.findAll.mockResolvedValue({
      matches: mockMatches,
      totalCount: 1,
    });

    const result = await matchService.getAllMatches(10, 1);

    // O serviço deve corrigir o status dinamicamente
    expect(result.data[0]!.MatchStatus).toBe(MatchStatus.EM_ANDAMENTO);
  });

  it("deve respeitar o status FINALIZADO (não reverter para EM_ANDAMENTO)", async () => {
    const mockMatches = [
      {
        id: "uuid-1",
        maxPlayers: 10,
        _count: { players: 5 },
        MatchDate: MOCK_PAST, // Data no passado
        MatchStatus: MatchStatus.FINALIZADO, // Status já finalizado
      },
    ] as any;

    mockedRepo.findAll.mockResolvedValue({
      matches: mockMatches,
      totalCount: 1,
    });

    const result = await matchService.getAllMatches(10, 1);

    // O serviço deve respeitar o status FINALIZADO
    expect(result.data[0]!.MatchStatus).toBe(MatchStatus.FINALIZADO);
  });
});
