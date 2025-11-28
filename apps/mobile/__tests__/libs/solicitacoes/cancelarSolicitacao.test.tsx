import { cancelarSolicitacao } from '@/libs/solicitacoes/cancelarSolicitacao'; 
import { api_route } from '@/libs/auth/api';

jest.mock('@/libs/auth/api', () => ({
  api_route: {
    delete: jest.fn(),
  },
}));

const mockedApi = api_route as jest.Mocked<typeof api_route>;

describe('cancelarSolicitacao', () => {
  const mockInviteId = '123-abc';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('deve chamar api.delete e retornar os dados', async () => {
    const mockResponse = { success: true };
    mockedApi.delete.mockResolvedValueOnce({ data: mockResponse });

    const result = await cancelarSolicitacao(mockInviteId);

    expect(mockedApi.delete).toHaveBeenCalledWith(`/invite/${mockInviteId}`);
    expect(result).toEqual(mockResponse);
  });

  it('deve retornar array vazio [] se ocorrer erro 400 ou 404', async () => {
    mockedApi.delete.mockRejectedValueOnce({ response: { status: 400 } });
    const result = await cancelarSolicitacao(mockInviteId);
    expect(result).toEqual([]);
  });

  it('deve lançar exceção para outros erros', async () => {
    const error = new Error('Erro de rede');
    mockedApi.delete.mockRejectedValueOnce(error);
    await expect(cancelarSolicitacao(mockInviteId)).rejects.toThrow('Erro de rede');
  });
});