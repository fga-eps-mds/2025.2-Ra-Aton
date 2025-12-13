import { loadGroups } from '@/libs/group/loadGroups'; 
import { api_route } from '@/libs/auth/api';
import { AxiosError } from 'axios';

// --- MOCKS ---

jest.mock('@/libs/auth/api', () => ({
  api_route: {
    get: jest.fn(),
  },
}));

describe('Lib: loadGroups', () => {
  const mockToken = 'mock-jwt-group';
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.log as jest.Mock).mockRestore();
  });

  it('deve chamar GET com o userId como query param e retornar os grupos', async () => {
    const mockGroups = [{ id: 'g1', name: 'Grupo X' }];
    (api_route.get as jest.Mock).mockResolvedValue({ data: mockGroups });

    const result = await loadGroups(mockToken, mockUserId);

    // Verifica a chamada correta da API
    expect(api_route.get).toHaveBeenCalledWith('/group/?userId=user-123', {
      headers: { Authorization: `Bearer ${mockToken}` }
    });
    
    // Verifica o log (opcional, mas bom para cobertura)
    expect(console.log).toHaveBeenCalledWith(
        `[loadGroups]: token ${mockToken}\t userId ${mockUserId}`
    );
    expect(result).toEqual(mockGroups);
  });

  // --- TRATAMENTO DE ERROS ESPECÍFICOS ---

  it('deve retornar array vazio se status for 400', async () => {
    const mockError = { response: { status: 400 } } as AxiosError;
    (api_route.get as jest.Mock).mockRejectedValue(mockError);

    const result = await loadGroups(mockToken, mockUserId);

    expect(console.log).toHaveBeenCalledWith('Error loading groups:', mockError);
    expect(result).toEqual([]);
  });

  it('deve retornar array vazio se status for 404', async () => {
    const mockError = { response: { status: 404 } } as AxiosError;
    (api_route.get as jest.Mock).mockRejectedValue(mockError);

    const result = await loadGroups(mockToken, mockUserId);

    expect(result).toEqual([]);
  });

  it('deve lançar exceção para outros status de erro (ex: 500)', async () => {
    const mockError = { response: { status: 500 } } as AxiosError;
    (api_route.get as jest.Mock).mockRejectedValue(mockError);

    await expect(loadGroups(mockToken, mockUserId)).rejects.toEqual(mockError);
  });
});