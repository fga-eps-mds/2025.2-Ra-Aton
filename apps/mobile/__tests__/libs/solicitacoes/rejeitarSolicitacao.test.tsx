import { rejeitarSolicitacao } from '@/libs/solicitacoes/rejeitarSolicitacao'; 
import { api_route } from '@/libs/auth/api';

jest.mock('@/libs/auth/api', () => ({
  api_route: {
    patch: jest.fn(),
  },
}));

const mockedApi = api_route as jest.Mocked<typeof api_route>;

describe('rejeitarSolicitacao', () => {
  const mockInviteId = '123-abc';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('deve chamar api.patch com status REJECTED e retornar os dados', async () => {
    const mockResponse = { id: mockInviteId, status: 'REJECTED' };
    mockedApi.patch.mockResolvedValueOnce({ data: mockResponse });

    const result = await rejeitarSolicitacao(mockInviteId);

    expect(mockedApi.patch).toHaveBeenCalledWith(`/invite/${mockInviteId}`, {
      status: 'REJECTED',
    });
    expect(result).toEqual(mockResponse);
  });

  it('deve retornar array vazio [] se ocorrer erro 400 ou 404', async () => {
    mockedApi.patch.mockRejectedValueOnce({ response: { status: 400 } });
    const result = await rejeitarSolicitacao(mockInviteId);
    expect(result).toEqual([]);
  });

  it('deve lançar exceção para outros erros', async () => {
    const error = { message: 'Erro genérico' };
    mockedApi.patch.mockRejectedValueOnce(error);
    await expect(rejeitarSolicitacao(mockInviteId)).rejects.toEqual(error);
  });
});