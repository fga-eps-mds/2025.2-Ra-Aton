// ARQUIVO: apps/mobile/__tests__/libs/hooks/useCreateGroupForm.test.ts
import { renderHook, act, waitFor } from '@testing-library/react-native'
import { useCreateGroupForm } from '@/libs/hooks/useCreateGroupForm'

// 1. Mock do serviço handleCreateGroup para não chamar o backend real
jest.mock('@/libs/group/handleCreateGroup', () => ({
  handleCreateGroup: jest.fn(),
}))

// 2. Mock do Expo Router para testar a navegação
const mockReplace = jest.fn()
const mockBack = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
    back: mockBack,
  }),
}))

// Importamos o mock do serviço para poder manipulá-lo
const { handleCreateGroup } = require('@/libs/group/handleCreateGroup')

describe('useCreateGroupForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve inicializar com valores padrão', () => {
    const { result } = renderHook(() => useCreateGroupForm())
    
    expect(result.current.selectedType).toBe('ATHLETIC')
    expect(result.current.isLoading).toBe(false)
  })

  it('deve validar campos obrigatórios (nome vazio)', async () => {
    const { result } = renderHook(() => useCreateGroupForm())

    // Tenta submeter sem preencher o nome
    await act(async () => {
      await result.current.submitForm()
    })

    // O serviço NÃO deve ser chamado
    expect(handleCreateGroup).not.toHaveBeenCalled()
    // Deve haver erro no campo 'name'
    expect(result.current.errors.name).toBeDefined()
  })

  it('deve chamar a API e redirecionar em caso de sucesso', async () => {
    // Configura o mock para retornar sucesso com um ID fictício
    handleCreateGroup.mockResolvedValue({
      id: 'grupo-123-id',
      name: 'Novo Grupo',
    })

    const { result } = renderHook(() => useCreateGroupForm())

    // Preenche o formulário com dados válidos
    await act(async () => {
      result.current.setValue('name', 'Novo Grupo')
      result.current.setValue('description', 'Descrição teste')
      result.current.setValue('type', 'AMATEUR')
      result.current.setValue('sport', 'Futsal')
    })

    // Submete o formulário
    await act(async () => {
      await result.current.submitForm()
    })

    // 1. Verifica se a API foi chamada com os dados corretos
    expect(handleCreateGroup).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Novo Grupo',
        type: 'AMATEUR',
        sports: ['Futsal'], // Verifica conversão para array
      })
    )

    // 2. Verifica se o redirecionamento aconteceu
    // Como usamos setTimeout no código, usamos waitFor no teste
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/group/[id]',
        params: { id: 'grupo-123-id' },
      })
    })
  })
})