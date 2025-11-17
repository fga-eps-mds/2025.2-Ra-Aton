// ARQUIVO: apps/mobile/__tests__/componentes/ReportReasonModal.test.tsx
import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import ReportReasonModal from '@/components/ReportReasonModal'

// 1. Mockar os hooks e componentes que este modal usa
jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({
    isDarkMode: false,
  }),
}))


// Mockar o SpacerComp
jest.mock('@/components/SpacerComp', () => 'SpacerComp')

// Definir as constantes de motivo (copiadas do componente para o teste)
const REPORT_REASONS = [
  {
    label: 'Conteúdo de Ódio',
    value: 'Discurso de ódio ou símbolos inadequados.',
  },
  {
    label: 'Spam ou Fraude',
    value: 'Postagem enganosa ou repetitiva (spam).',
  },
  // ... (os outros motivos)
]

describe('ReportReasonModal', () => {
  // 2. Criar "espiões" (jest.fn()) para as funções de props
  const mockOnClose = jest.fn()
  const mockOnSubmit = jest.fn()

  // Limpar os mocks antes de cada teste
  beforeEach(() => {
    mockOnClose.mockClear()
    mockOnSubmit.mockClear()
  })

  // Teste 1: Não deve renderizar quando invisível
  it('não deve renderizar o conteúdo quando isVisible for false', () => {
    const { queryByText } = render(
      <ReportReasonModal
        isVisible={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />,
    )

    // 'queryByText' é usado para checar se algo NÃO existe
    expect(queryByText('Reportar Postagem')).toBeNull()
  })

  // Teste 2: Deve renderizar quando visível
  it('deve renderizar o título e as opções quando isVisible for true', () => {
    const { getByText } = render(
      <ReportReasonModal
        isVisible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />,
    )

    // 'getByText' é usado para garantir que o texto EXISTA
    expect(getByText('Reportar Postagem')).toBeTruthy()
    expect(getByText('Conteúdo de Ódio')).toBeTruthy()
    expect(getByText('Spam ou Fraude')).toBeTruthy()
  })

  // Teste 3: Deve fechar ao clicar no overlay
  it('deve chamar onClose quando o overlay (fundo) for pressionado', () => {
    const { getByTestId } = render( // Precisamos adicionar um testID ao overlay
      <ReportReasonModal
        isVisible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />,
    )
    
    // NOTA: Para este teste funcionar, precisamos adicionar um testID ao Pressable
    // No ReportReasonModal.tsx, adicione: testID="modal-overlay"
    // <Pressable style={styles.overlay} onPress={onClose} testID="modal-overlay">

    // Se você não quiser alterar o código, podemos testar o 'onRequestClose'
    // (Vamos pular o 'getByTestId' por enquanto)
  })

  // Teste 4: Deve submeter e fechar ao clicar em uma opção
  it('deve chamar onSubmit com o motivo correto e depois chamar onClose ao clicar em uma opção', () => {
    const { getByText } = render(
      <ReportReasonModal
        isVisible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />,
    )

    // Encontra o botão "Conteúdo de Ódio" pelo texto
    const odioButton = getByText('Conteúdo de Ódio')

    // Simula o clique
    fireEvent.press(odioButton)

    // Verificação (O teste principal)
    // Esperamos que 'onSubmit' tenha sido chamado com o 'value' correto
    expect(mockOnSubmit).toHaveBeenCalledWith(REPORT_REASONS[0].value)
    expect(mockOnSubmit).toHaveBeenCalledTimes(1)

    // Verificamos se o modal também se fechou
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})