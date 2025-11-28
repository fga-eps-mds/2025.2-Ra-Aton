import { loadSolicitacoes } from '@/libs/solicitacoes/loadSolicitacoes'; 
import { api_route } from '@/libs/auth/api';

// Mock apenas do método necessário (get)
jest.mock('@/libs/auth/api', () => ({
  api_route: {
    get: jest.fn(),
  },
}));

const mockedApi = api_route as jest.Mocked<typeof api_route>;

describe('loadSolicitacoes', () => {
  const mockUserId = 'user-xyz';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('deve chamar api.get na rota correta e retornar a lista', async () => {
    const mockList = [{ id: '1' }, { id: '2' }];
    mockedApi.get.mockResolvedValueOnce({ data: mockList });

    const result = await loadSolicitacoes(mockUserId);

    expect(mockedApi.get).toHaveBeenCalledWith(`/invite/all/user/${mockUserId}`);
    expect(result).toEqual(mockList);
  });

  it('deve retornar array vazio [] se ocorrer erro 404', async () => {
    mockedApi.get.mockRejectedValueOnce({ response: { status: 404 } });
    const result = await loadSolicitacoes(mockUserId);
    expect(result).toEqual([]);
  });

  it('deve lançar exceção para outros erros', async () => {
    const error = { response: { status: 500 } };
    mockedApi.get.mockRejectedValueOnce(error);
    await expect(loadSolicitacoes(mockUserId)).rejects.toEqual(error);
  });
});