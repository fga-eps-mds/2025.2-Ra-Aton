import React from "react";
import { render, fireEvent } from "../test-utils";
import CommentsModalComp from "../../components/CommentsModalComp";

describe("Componente: CommentsModalComp", () => {
  const mockOnClose = jest.fn();

  it("1. Não deve renderizar nada se isVisible for false", () => {
    const { queryByText } = render(
      <CommentsModalComp isVisible={false} onClose={mockOnClose} postId="1" />,
    );

    expect(queryByText("Comentários")).toBeNull();
  });

  it("2. Deve renderizar o conteúdo se isVisible for true", () => {
    const { getByText, getByPlaceholderText } = render(
      <CommentsModalComp isVisible={true} onClose={mockOnClose} postId="1" />,
    );

    expect(getByText("Comentários")).toBeTruthy();
    expect(getByPlaceholderText("Escreva um comentário...")).toBeTruthy();

    // Testa os dados mockados
    expect(getByText("Usuário A")).toBeTruthy();
    expect(getByText("Que legal!")).toBeTruthy();
  });

  it("3. Deve permitir digitação no input de comentário", () => {
    const { getByPlaceholderText } = render(
      <CommentsModalComp isVisible={true} onClose={mockOnClose} postId="1" />,
    );

    const input = getByPlaceholderText("Escreva um comentário...");
    fireEvent.changeText(input, "Meu novo comentário");
    expect(input.props.value).toBe("Meu novo comentário");
  });
});
