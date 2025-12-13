import { unfollowGroup } from '@/libs/group/unfollowGroup'; 
import { api_route } from '@/libs/auth/api';
import { AxiosError } from 'axios';

// --- MOCKS ---

jest.mock('@/libs/auth/api', () => ({
  api_route: {
    delete: jest.fn(),
  },
}));

describe('Lib: unfollowGroup', () => {
  const mockToken = 'mock-jwt';
  const mockGroupName = 'Atlética Teste';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.log as jest.Mock).mockRestore();
  });

  it('deve chamar DELETE na rota correta com Token no segundo argumento', async () => {
    const mockResponse = { data: { ok: true } };
    (api_route.delete as jest.Mock).mockResolvedValue(mockResponse);

    const result = await unfollowGroup(mockToken, mockGroupName);

    // Verifica a chamada correta da API
    // O Axios espera headers como segundo argumento em chamadas GET/DELETE sem body.
    expect(api_route.delete).toHaveBeenCalledWith(
      'follow/groups/Atlética Teste/follow',
      { headers: { Authorization: `Bearer ${mockToken}` } }
    );
    // Verifica o log de sucesso
    expect(console.log).toHaveBeenCalledWith('Você deixou de seguir o grupo');
    expect(result).toEqual(mockResponse.data);
  });

  // --- TRATAMENTO DE ERROS ESPECÍFICOS ---

  it('deve retornar objeto de erro tratado se status for 409 (Não segue)', async () => {
    const mockError = { response: { status: 409 } } as AxiosError;
    (api_route.delete as jest.Mock).mockRejectedValue(mockError);

    const result = await unfollowGroup(mockToken, mockGroupName);

    expect(console.log).toHaveBeenCalledWith('Voce não segue o grupo.');
    expect(result).toEqual({ ok: false, message: 'Voce não segue o grupo.' });
  });

  it('deve retornar objeto de erro tratado se status for 400/404', async () => {
    const mockErrorData = { message: 'Grupo inexistente' };
    const mockError = { response: { status: 404, data: mockErrorData } } as AxiosError;
    (api_route.delete as jest.Mock).mockRejectedValue(mockError);

    const result = await unfollowGroup(mockToken, mockGroupName);

    // Retorna a mensagem de erro da API
    expect(result).toEqual({ ok: false, message: mockErrorData });
  });

  it('deve lançar exceção para outros status de erro (ex: 500)', async () => {
    const mockError = { response: { status: 500 } } as AxiosError;
    (api_route.delete as jest.Mock).mockRejectedValue(mockError);

    await expect(unfollowGroup(mockToken, mockGroupName)).rejects.toEqual(mockError);
  });
});