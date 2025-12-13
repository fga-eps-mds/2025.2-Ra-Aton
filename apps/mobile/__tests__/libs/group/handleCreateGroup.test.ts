import { handleCreateGroup, CreateGroupPayload } from '@/libs/group/handleCreateGroup'; 
import { api_route } from '@/libs/auth/api';
import { AxiosError } from 'axios';

// --- MOCKS ---

jest.mock('@/libs/auth/api', () => ({
  api_route: {
    post: jest.fn(),
  },
}));

describe('Lib: handleCreateGroup', () => {
  const mockPayload: CreateGroupPayload = {
    name: 'Atlética de Teste',
    description: 'Grupo para testes unitários.',
    sports: ['Futebol', 'Vôlei'],
    verificationRequest: true,
    acceptingNewMembers: true,
    type: 'ATHLETIC', // Esta propriedade deve ser REMOVIDA antes de enviar
  };

  const expectedPayloadSent = {
    name: 'Atlética de Teste',
    description: 'Grupo para testes unitários.',
    sports: ['Futebol', 'Vôlei'],
    verificationRequest: true,
    acceptingNewMembers: true,
    // Note que a propriedade 'type' está ausente
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.log as jest.Mock).mockRestore();
    (console.error as jest.Mock).mockRestore();
  });

  it('deve chamar POST na rota /group, remover o campo "type" e retornar os dados do grupo', async () => {
    const mockResponse = { id: 'g1', name: 'Atlética de Teste' };
    (api_route.post as jest.Mock).mockResolvedValue({ data: mockResponse });

    const result = await handleCreateGroup(mockPayload);

    // 1. Verifica se o payload enviado está correto (sem 'type')
    expect(api_route.post).toHaveBeenCalledWith(
      '/group',
      expectedPayloadSent
    );
    
    // 2. Verifica o log de envio
    expect(console.log).toHaveBeenCalledWith(
      'Enviando dados do grupo para /group (sem type):',
      expectedPayloadSent
    );

    // 3. Verifica o retorno
    expect(result).toEqual(mockResponse);
  });

  describe('Tratamento de Erros', () => {
    
    it('deve lançar erro extraindo mensagens de validação (Zod/Joi - issues array)', async () => {
      const errorData = {
        issues: [
          { message: 'O nome é obrigatório' },
          { message: 'Descrição é muito curta' },
        ],
        message: 'Validation Failed',
      };
      const mockError = { response: { data: errorData } } as AxiosError;
      (api_route.post as jest.Mock).mockRejectedValue(mockError);

      await expect(handleCreateGroup(mockPayload)).rejects.toThrow('O nome é obrigatório / Descrição é muito curta');
      
      expect(console.error).toHaveBeenCalledWith('Erro no handleCreateGroup:', 'O nome é obrigatório / Descrição é muito curta');
    });

    it('deve lançar erro se o servidor retornar string JSON parseável', async () => {
      const errorStr = JSON.stringify({ message: 'Grupo com este nome já existe' });
      const mockError = { response: { data: errorStr } } as AxiosError;
      (api_route.post as jest.Mock).mockRejectedValue(mockError);

      await expect(handleCreateGroup(mockPayload)).rejects.toThrow('Grupo com este nome já existe');
    });

    it('deve lançar erro padrão se for string não parseável', async () => {
      const errorRaw = 'Bad Request - Missing field';
      const mockError = { response: { data: errorRaw } } as AxiosError;
      (api_route.post as jest.Mock).mockRejectedValue(mockError);

      await expect(handleCreateGroup(mockPayload)).rejects.toThrow('Bad Request - Missing field');
    });

    it('deve lançar erro de conexão se não houver resposta do servidor (error.request)', async () => {
      const networkError = { request: {} }; 
      (api_route.post as jest.Mock).mockRejectedValue(networkError);

      await expect(handleCreateGroup(mockPayload)).rejects.toThrow('Sem resposta do servidor. Verifique sua conexão.');
    });

    it('deve lançar erro genérico se for outro tipo de falha', async () => {
      const genericError = new Error('Erro de runtime');
      (api_route.post as jest.Mock).mockRejectedValue(genericError);

      await expect(handleCreateGroup(mockPayload)).rejects.toThrow('Erro ao criar o grupo.');
    });

    it('deve usar parsed.error quando parsed.message não existir', async () => {
  const errorStr = JSON.stringify({ error: 'Erro vindo da API' });
  const mockError = { response: { data: errorStr } };

  (api_route.post as jest.Mock).mockRejectedValue(mockError);

  await expect(handleCreateGroup(mockPayload))
    .rejects
    .toThrow('Erro vindo da API');
});
it('deve usar mensagem padrão quando parsed não tiver message nem error', async () => {
  const errorStr = JSON.stringify({ foo: 'bar' });
  const mockError = { response: { data: errorStr } };

  (api_route.post as jest.Mock).mockRejectedValue(mockError);

  await expect(handleCreateGroup(mockPayload))
    .rejects
    .toThrow('Erro ao criar o grupo.');
});

it('deve usar data.message quando data não for string e não tiver issues', async () => {
  const errorData = {
    message: 'Mensagem direta do backend',
  };

  const mockError = {
    response: { data: errorData },
  };

  (api_route.post as jest.Mock).mockRejectedValue(mockError);

  await expect(handleCreateGroup(mockPayload))
    .rejects
    .toThrow('Mensagem direta do backend');
});

it('deve usar data.error quando data.message não existir (else interno)', async () => {
  const errorData = {
    error: 'Erro vindo do campo error',
  };

  const mockError = {
    response: { data: errorData },
  };

  (api_route.post as jest.Mock).mockRejectedValue(mockError);

  await expect(handleCreateGroup(mockPayload))
    .rejects
    .toThrow('Erro vindo do campo error');
});

it('deve usar mensagem padrão quando data não tiver message nem error (else interno)', async () => {
  const errorData = {
    foo: 'bar',
  };

  const mockError = {
    response: { data: errorData },
  };

  (api_route.post as jest.Mock).mockRejectedValue(mockError);

  await expect(handleCreateGroup(mockPayload))
    .rejects
    .toThrow('Erro ao criar o grupo.');
});

  });
});