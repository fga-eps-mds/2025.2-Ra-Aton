import React from "react";
// Importa 'waitFor' para lidar com a atualização de estado assíncrona
import { render, fireEvent, waitFor } from "../test-utils";
import LikeButtonComp from "../../components/LikeButtonComp";

// Mock da função de API que deve retornar uma Promise
const mockOnLike = jest.fn(() => Promise.resolve());

describe("Componente: LikeButtonComp", () => {
  beforeEach(() => {
    // Limpa o mock antes de cada teste
    mockOnLike.mockClear();
  });

  it('1. Deve renderizar o ícone de "não curtido" (outline) por padrão', () => {
    const { getByTestId } = render(<LikeButtonComp onLike={mockOnLike} />);
    // Adicione testID="like-button-icon" ao <Ionicons> em LikeButtonComp.tsx
    // Ex: <Ionicons testID="like-button-icon" name={...} />

    const icon = getByTestId("like-button-icon");
    expect(icon.props.name).toBe("heart-outline");
  });

  it('2. Deve renderizar o ícone de "curtido" (filled) se initialLiked for true', () => {
    const { getByTestId } = render(
      <LikeButtonComp onLike={mockOnLike} initialLiked={true} />,
    );

    const icon = getByTestId("like-button-icon");
    expect(icon.props.name).toBe("heart");
  });

  it("3. Deve chamar onLike e mudar o ícone ao ser pressionado (de outline para filled)", async () => {
    const { getByTestId } = render(<LikeButtonComp onLike={mockOnLike} />);

    const icon = getByTestId("like-button-icon");
    expect(icon.props.name).toBe("heart-outline"); // Estado inicial

    // Simula o clique
    fireEvent.press(icon);

    // Verifica se a API (mock) foi chamada com 'true' (novo estado: curtido)
    expect(mockOnLike).toHaveBeenCalledWith(true);

    // Espera a Promise resolver e o estado ser atualizado
    await waitFor(() => {
      // Verifica se o ícone mudou para 'filled'
      expect(getByTestId("like-button-icon").props.name).toBe("heart");
    });
  });
});
