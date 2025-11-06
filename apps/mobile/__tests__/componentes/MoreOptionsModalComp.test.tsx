import React from "react";
import { render, fireEvent } from "../test-utils";
import MoreOptionsModalComp from "../../components/MoreOptionsModalComp";

describe("Componente: MoreOptionsModalComp", () => {
  const mockOnClose = jest.fn();
  const mockOnReport = jest.fn();
  const mockOnDelete = jest.fn();

  it("1. Não deve renderizar nada se isVisible for false", () => {
    const { queryByText } = render(
      <MoreOptionsModalComp
        isVisible={false}
        onClose={mockOnClose}
        onReport={mockOnReport}
      />,
    );

    expect(queryByText("Reportar Post")).toBeNull();
  });

  it("2. Deve renderizar o conteúdo se isVisible for true", () => {
    const { getByText } = render(
      <MoreOptionsModalComp
        isVisible={true}
        onClose={mockOnClose}
        onReport={mockOnReport}
      />,
    );

    expect(getByText("Reportar Post")).toBeTruthy();
  });

  it("3. Deve mostrar o botão de Excluir se onDelete for fornecido", () => {
    const { getByText } = render(
      <MoreOptionsModalComp
        isVisible={true}
        onClose={mockOnClose}
        onReport={mockOnReport}
        onDelete={mockOnDelete}
      />,
    );

    expect(getByText("Reportar Post")).toBeTruthy();
    expect(getByText("Excluir Post")).toBeTruthy();
  });

  it("4. Deve chamar onReport ao clicar em Reportar", () => {
    const { getByText } = render(
      <MoreOptionsModalComp
        isVisible={true}
        onClose={mockOnClose}
        onReport={mockOnReport}
      />,
    );

    fireEvent.press(getByText("Reportar Post"));
    expect(mockOnReport).toHaveBeenCalledTimes(1);
  });
});
