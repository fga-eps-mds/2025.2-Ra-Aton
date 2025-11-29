import { aceitarSolicitacao } from '@/libs/solicitacoes/aceitarSolicitacao'; 
import { api_route } from '@/libs/auth/api';

jest.mock('@/libs/auth/api', () => ({
  api_route: {
    patch: jest.fn(),
  },
}));

const mockedApi = api_route as jest.Mocked<typeof api_route>;

describe('aceitarSolicitacao', () => {
  const mockInviteId = '123-abc';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('deve chamar api.patch com status APPROVED e retornar os dados', async () => {
    const mockResponse = { id: mockInviteId, status: 'APPROVED' };
    mockedApi.patch.mockResolvedValueOnce({ data: mockResponse });

    const result = await aceitarSolicitacao(mockInviteId);

    expect(mockedApi.patch).toHaveBeenCalledWith(`/invite/${mockInviteId}`, {
      status: 'APPROVED',
    });
    expect(result).toEqual(mockResponse);
  });

  it('deve retornar array vazio [] se ocorrer erro 400 ou 404', async () => {
    mockedApi.patch.mockRejectedValueOnce({ response: { status: 404 } });
    const result = await aceitarSolicitacao(mockInviteId);
    expect(result).toEqual([]);
  });

  it('deve lançar exceção para outros erros', async () => {
    const error = { response: { status: 500 } };
    mockedApi.patch.mockRejectedValueOnce(error);
    await expect(aceitarSolicitacao(mockInviteId)).rejects.toEqual(error);
  });
});