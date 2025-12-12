import { createPartida } from '@/libs/criar/createPartida';
import { api_route } from '@/libs/auth/api';

jest.mock('@/libs/auth/api', () => ({
  api_route: {
    post: jest.fn(),
  },
}));

const mockedApi = api_route as jest.Mocked<typeof api_route>;

describe('createPartida', () => {
  const mockParams = {
    author: { name: 'User Test' },
    userId: '123',
    title: 'Jogo Teste',
    description: 'Descrição teste',
    sport: 'Futebol',
    maxPlayers: 10,
    teamNameA: 'Time A',
    teamNameB: 'Time B',
    MatchDate: '2026-12-31T20:01:00.000Z', // Alterado para o formato ISO 8601
    location: 'Quadra Central',
    token: 'fake-jwt-token',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('deve chamar a API com os dados corretamente formatados (Sucesso)', async () => {
    const mockResponse = { data: { id: 'partida-123', title: 'Jogo Teste' } };
    mockedApi.post.mockResolvedValueOnce(mockResponse);

    const result = await createPartida(mockParams);

    expect(mockedApi.post).toHaveBeenCalledWith(
      '/match/',
      {
        author: mockParams.author,
        userId: mockParams.userId,
        title: mockParams.title,
        description: mockParams.description,
        sport: mockParams.sport,
        maxPlayers: mockParams.maxPlayers,
        teamNameA: mockParams.teamNameA,
        teamNameB: mockParams.teamNameB,
        MatchDate: mockParams.MatchDate,
        location: mockParams.location,
      },
      {
        headers: {
          Authorization: `Bearer ${mockParams.token}`,
        },
      }
    );

    expect(result).toEqual(mockResponse.data);
  });

  it('deve retornar erro imediato quando formato da data for inválido', async () => {
    const paramsComDataRuim = { ...mockParams, MatchDate: '31/12/2026 12' }; // Formato errado

    const result = await createPartida(paramsComDataRuim);

    expect(result).toEqual({ error: 'Formato da data inválido' });
    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  it('deve retornar erro para datas impossíveis (ex: 99/99/2025)', async () => {
    const paramsComDataRuim = { ...mockParams, MatchDate: '0000-32-32T25:01:00.000Z' }; // Data impossível

    const result = await createPartida(paramsComDataRuim);

    expect(result).toEqual({ error: "Data impossível." });
    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  it('deve tratar erro da API (ex: 400 Bad Request)', async () => {
    const mockError = {
      response: {
        data: {
          issues: [{ message: 'Nome do time muito curto' }],
        },
      },
    };
// const paramsNomeCurto = { ...mockParams, title: 'A'};


    mockedApi.post.mockRejectedValueOnce(mockError);

    const result = await createPartida(mockParams);

    expect(result).toEqual({ error: 'Nome do time muito curto' });
  });

  it('deve lançar erro quando não há resposta do servidor (Erro de rede)', async () => {
    const mockNetworkError = { request: {} };

    mockedApi.post.mockRejectedValueOnce(mockNetworkError);

    await expect(createPartida(mockParams)).rejects.toThrow(
      'Não foi possível conectar ao servidor.'
    );
  });

  it('deve lançar erro genérico para exceções inesperadas', async () => {
    const mockUnexpected = new Error('Falha catastrófica');

    mockedApi.post.mockRejectedValueOnce(mockUnexpected);

    await expect(createPartida(mockParams)).rejects.toThrow(
      'Erro inesperado ao criar [partida].'
    );
  });
});
