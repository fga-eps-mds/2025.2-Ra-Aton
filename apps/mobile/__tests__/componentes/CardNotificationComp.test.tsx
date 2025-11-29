import React from "react";
import { render, fireEvent } from "../test-utils"; // Usando seu utils personalizado
import CardNotificationComp from "../../components/CardNotificationComp";

describe("Componente: CardNotificationComp", () => {
  // Mocks das funções
  const mockOnMarkAsRead = jest.fn();
  const mockOnView = jest.fn();

  const defaultProps = {
    title: "Título de Teste",
    description: "Descrição de teste para notificação",
    isRead: false,
    onMarkAsRead: mockOnMarkAsRead,
    onView: mockOnView,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("1. Deve renderizar o título e a descrição corretamente", () => {
    const { getByText } = render(<CardNotificationComp {...defaultProps} />);

    expect(getByText("Título de Teste")).toBeTruthy();
    expect(getByText("Descrição de teste para notificação")).toBeTruthy();
  });

  it('2. Deve mostrar o botão "Marcar como lida" quando isRead é false', () => {
    const { getByText } = render(
      <CardNotificationComp {...defaultProps} isRead={false} />
    );

    const button = getByText("Marcar como lida");
    expect(button).toBeTruthy();
  });

  it('3. NÃO deve mostrar o botão "Marcar como lida" quando isRead é true', () => {
    const { queryByText } = render(
      <CardNotificationComp {...defaultProps} isRead={true} />
    );

    // queryByText retorna null se não encontrar (usado para verificar ausência)
    const button = queryByText("Marcar como lida");
    expect(button).toBeNull();
  });

  it('4. Deve chamar a função onMarkAsRead ao pressionar o botão', () => {
    const { getByText } = render(
      <CardNotificationComp {...defaultProps} isRead={false} />
    );

    const button = getByText("Marcar como lida");
    fireEvent.press(button);

    expect(mockOnMarkAsRead).toHaveBeenCalledTimes(1);
  });

  it('5. Deve mostrar o botão "Visualizar" se a prop onView for fornecida', () => {
    const { getByText } = render(
      <CardNotificationComp {...defaultProps} onView={mockOnView} />
    );

    const button = getByText("Visualizar");
    expect(button).toBeTruthy();
  });

  it('6. NÃO deve mostrar o botão "Visualizar" se a prop onView for undefined', () => {
    const { queryByText } = render(
      <CardNotificationComp {...defaultProps} onView={undefined} />
    );

    const button = queryByText("Visualizar");
    expect(button).toBeNull();
  });

  it('7. Deve chamar a função onView ao pressionar o botão "Visualizar"', () => {
    const { getByText } = render(
      <CardNotificationComp {...defaultProps} onView={mockOnView} />
    );

    const button = getByText("Visualizar");
    fireEvent.press(button);

    expect(mockOnView).toHaveBeenCalledTimes(1);
  });
});