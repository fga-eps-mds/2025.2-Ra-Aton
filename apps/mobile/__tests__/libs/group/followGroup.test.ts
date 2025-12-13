import { followGroup } from '@/libs/group/followGroup'; 
import { api_route } from '@/libs/auth/api';
import { AxiosError } from 'axios';

// --- MOCKS ---

jest.mock('@/libs/auth/api', () => ({
  api_route: {
    post: jest.fn(),
  },
}));

describe('Lib: followGroup', () => {
  const mockToken = 'mock-jwt';
  const mockGroupName = 'Atlética Teste';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.log as jest.Mock).mockRestore();
  });

  it('deve chamar POST na rota correta com Token no header e retornar dados', async () => {
    const mockResponse = { data: { ok: true } };
    (api_route.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await followGroup(mockToken, mockGroupName);

    // Verifica a chamada correta da API
    expect(api_route.post).toHaveBeenCalledWith(
      'follow/groups/Atlética Teste/follow', // <--- CORREÇÃO: Sem a barra inicial
      { groupName: mockGroupName },
      { headers: { Authorization: `Bearer ${mockToken}` } }
    );
    // Verifica o log de sucesso
    expect(console.log).toHaveBeenCalledWith('Você está seguindo o grupo');
    expect(result).toEqual(mockResponse.data);
  });

  // --- TRATAMENTO DE ERROS ESPECÍFICOS ---

  it('deve retornar objeto de erro tratado se status for 409 (Já segue)', async () => {
    const mockError = { response: { status: 409 } } as AxiosError;
    (api_route.post as jest.Mock).mockRejectedValue(mockError);

    const result = await followGroup(mockToken, mockGroupName);

    expect(console.log).toHaveBeenCalledWith('Voce ja segue o grupo.');
    expect(result).toEqual({ ok: false, message: 'Voce ja segue o grupo.' });
  });

  it('deve retornar objeto de erro tratado se status for 400', async () => {
    const mockErrorData = { message: 'Grupo inexistente' };
    const mockError = { response: { status: 400, data: mockErrorData } } as AxiosError;
    (api_route.post as jest.Mock).mockRejectedValue(mockError);

    const result = await followGroup(mockToken, mockGroupName);

    // Retorna a mensagem de erro da API
    expect(result).toEqual({ ok: false, message: mockErrorData });
  });

  it('deve lançar exceção para outros status de erro (ex: 500)', async () => {
    const mockError = { response: { status: 500 } } as AxiosError;
    (api_route.post as jest.Mock).mockRejectedValue(mockError);

    await expect(followGroup(mockToken, mockGroupName)).rejects.toEqual(mockError);
    
    // Verifica log genérico
    expect(console.log).toHaveBeenCalledWith('Erro ao seguir grupo:', mockError);
  });
});