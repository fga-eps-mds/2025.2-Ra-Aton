import React from "react";
import { render, fireEvent, waitFor } from "../test-utils";
import ImGoingButtonComp from "../../components/ImGoingButtonComp";

const mockOnToggleGoing = jest.fn(() => Promise.resolve());

describe("Componente: ImGoingButtonComp", () => {
  beforeEach(() => {
    mockOnToggleGoing.mockClear();
  });

  it('1. Deve renderizar o ícone de "não vou" (outline) por padrão', () => {
    const { getByTestId } = render(
      <ImGoingButtonComp onToggleGoing={mockOnToggleGoing} />,
    );
    // Adicione testID="going-button-icon" ao <Ionicons> em ImGoingButtonComp.tsx

    const icon = getByTestId("going-button-icon");
    expect(icon.props.name).toBe("checkmark-circle-outline");
  });

  it("2. Deve chamar onToggleGoing e mudar o ícone ao ser pressionado", async () => {
    const { getByTestId } = render(
      <ImGoingButtonComp onToggleGoing={mockOnToggleGoing} />,
    );

    const icon = getByTestId("going-button-icon");

    // Simula o clique
    fireEvent.press(icon);

    // Verifica se a API (mock) foi chamada com 'true' (novo estado: vou)
    expect(mockOnToggleGoing).toHaveBeenCalledWith(true);

    // Espera a Promise resolver e o estado ser atualizado
    await waitFor(() => {
      expect(getByTestId("going-button-icon").props.name).toBe(
        "checkmark-circle",
      );
    });
  });
});
