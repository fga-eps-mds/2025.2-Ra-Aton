// ARQUIVO: apps/mobile/__tests__/libs/group/handleCreateGroup.test.ts

// 1. MOCK TOTAL do módulo de API para evitar erros do Expo/Native
jest.mock('@/libs/auth/api', () => {
  return {
    api_route: {
      post: jest.fn(),
    },
  }
})

// 2. Importamos a função que vamos testar
import { handleCreateGroup, CreateGroupPayload } from '@/libs/group/handleCreateGroup'

// 3. Acessamos o mock para fazer as verificações
const { api_route } = require('@/libs/auth/api')
const mockedApiPost = api_route.post

describe('handleCreateGroup', () => {
  beforeEach(() => {
    mockedApiPost.mockClear()
  })

  it('deve chamar a API com a URL correta e SEM o campo "type" no payload', async () => {
    // Mock da resposta de sucesso do backend
    const mockResponse = {
      data: {
        id: '123',
        name: 'Grupo Teste',
        description: 'Desc',
        groupType: 'ATHLETIC', // Backend pode retornar, mas nós não enviamos
      },
    }
    mockedApiPost.mockResolvedValue(mockResponse)

    // Dados de entrada do formulário
    const payload: CreateGroupPayload = {
      name: 'Grupo Teste',
      description: 'Desc',
      type: 'ATHLETIC', // <--- CAMPO A SER REMOVIDO
      verificationRequest: true,
      acceptingNewMembers: true,
      sports: ['Futebol'],
    }

    // Executa a função
    const result = await handleCreateGroup(payload)

    // Verificações:
    // 1. O resultado retornado deve ser os dados do grupo (response.data)
    expect(result).toEqual(mockResponse.data)

    // 2. A URL deve ser '/group'
    // 3. O payload enviado NÃO deve ter a chave 'type'
    expect(mockedApiPost).toHaveBeenCalledWith(
      '/group',
      expect.objectContaining({
        name: 'Grupo Teste',
        verificationRequest: true,
      })
    )

    // Verificação de segurança extra: garantir que 'type' foi deletado
    const args = mockedApiPost.mock.calls[0]
    const sentPayload = args[1]
    expect(sentPayload).not.toHaveProperty('type')
  })

  it('deve lançar erro formatado quando a API falhar', async () => {
    const errorMessage = 'Nome já está em uso'
    // Simula erro da API
    mockedApiPost.mockRejectedValue({
      response: {
        data: { message: errorMessage },
      },
    })

    const payload: CreateGroupPayload = {
      name: 'Grupo Duplicado',
      verificationRequest: true,
      type: 'AMATEUR', // Mesmo em erro, a função tenta processar
    }

    // Espera que a função lance uma exceção com a mensagem correta
    await expect(handleCreateGroup(payload)).rejects.toThrow(errorMessage)
  })
})