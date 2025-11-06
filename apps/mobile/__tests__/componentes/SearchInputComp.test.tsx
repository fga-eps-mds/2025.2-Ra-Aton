import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SearchInputComp from "@/components/SearchInputComp";
import { ThemeProvider } from "../../constants/Theme";

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe("Componente: SearchInputComp", () => {
  it("1. Deve renderizar corretamente com o Placeholder", () => {
    const { getByPlaceholderText } = renderWithTheme(<SearchInputComp />);
    expect(getByPlaceholderText("Pesquisar...")).toBeTruthy();
  });

  it("2. Deve permitir a digitação do usuário", () => {
    const { getByPlaceholderText } = renderWithTheme(<SearchInputComp />);
    const input = getByPlaceholderText("Pesquisar...");

    //simular a digitação do user
    fireEvent.changeText(input, "Testando a pesquisa");

    // verifica se o valor do input foi atualizado
    expect(input.props.value).toBe("Testando a pesquisa");
  });

  it("3. Deve chamar o onSearch ao submeter (onSubmitingEditing)", () => {
    //função MOCK para o onsearch
    const mockOnSearch = jest.fn();

    const { getByPlaceholderText } = renderWithTheme(
      <SearchInputComp onSearch={mockOnSearch} />,
    );
    const input = getByPlaceholderText("Pesquisar...");
    const textoPesquisa = "Teste de pesquisa";
    // Simulando a digitação do usuário:
    fireEvent.changeText(input, textoPesquisa);
    //simulando o envio do texto com ENTER
    fireEvent(input, "submitEditing");
    //verifica se a função MOCK foi chamada com o texto correto
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    //verifica se chamou com o texto correto
    expect(mockOnSearch).toHaveBeenCalledWith(textoPesquisa);
  });
});
