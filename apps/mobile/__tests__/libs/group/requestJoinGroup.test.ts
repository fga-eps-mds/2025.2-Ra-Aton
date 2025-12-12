import { requestJoinGroup } from '@/libs/group/requestJoinGroup'; 
import { api_route } from '@/libs/auth/api';
import { AxiosError } from 'axios';

// --- MOCKS ---

jest.mock('@/libs/auth/api', () => ({
  api_route: {
    post: jest.fn(),
  },
}));

describe('Lib: requestJoinGroup', () => {
  const mockUserId = 'user-abc';
  const mockToken = 'mock-jwt';
  const mockGroupId = 'group-123';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.log as jest.Mock).mockRestore();
  });

  it('deve chamar POST na rota /invite com o body e headers corretos', async () => {
    const mockResponse = { data: { id: 'invite-1' } };
    (api_route.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await requestJoinGroup(mockUserId, mockToken, mockGroupId);

    // Verifica a chamada correta da API
    expect(api_route.post).toHaveBeenCalledWith(
      '/invite',
      {
        userId: mockUserId,
        groupId: mockGroupId,
        madeBy: 'USER',
        message: 'Quero participar do grupo.',
      },
      { headers: { Authorization: `Bearer ${mockToken}` } }
    );
    // Verifica o log de inicialização
    expect(console.log).toHaveBeenCalledWith(
      `Requesting to join group ${mockGroupId} by user ${mockUserId}`
    );
    expect(result).toEqual(mockResponse.data);
  });

  // --- TRATAMENTO DE ERROS ESPECÍFICOS ---

  it('deve retornar objeto de erro tratado se status for 409 (Já em análise)', async () => {
    const mockError = { response: { status: 409 } } as AxiosError;
    (api_route.post as jest.Mock).mockRejectedValue(mockError);

    const result = await requestJoinGroup(mockUserId, mockToken, mockGroupId);

    expect(console.log).toHaveBeenCalledWith('Sua solicitação já está em análise.');
    expect(result).toEqual({ ok: false, message: 'Sua solicitação já está em análise.' });
  });

  it('deve retornar objeto de erro tratado se status for 400/404', async () => {
    const mockErrorData = 'Grupo não existe ou usuário já é membro';
    const mockError = { response: { status: 400, data: mockErrorData } } as AxiosError;
    (api_route.post as jest.Mock).mockRejectedValue(mockError);

    const result = await requestJoinGroup(mockUserId, mockToken, mockGroupId);

    // Retorna a mensagem de erro da API
    expect(result).toEqual({ ok: false, message: mockErrorData });
  });

  it('deve lançar exceção para outros status de erro (ex: 500)', async () => {
    const mockError = { response: { status: 500 } } as AxiosError;
    (api_route.post as jest.Mock).mockRejectedValue(mockError);

    await expect(requestJoinGroup(mockUserId, mockToken, mockGroupId)).rejects.toEqual(mockError);
  });
});