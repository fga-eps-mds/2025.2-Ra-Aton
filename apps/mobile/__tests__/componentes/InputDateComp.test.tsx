import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import InputDateComp from "@/components/InputDateWebComp";

// Mock do tema
jest.mock("@/constants/Theme", () => ({
  useTheme: () => ({
    isDarkMode: false,
  }),
}));

// Mock do Ionicons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: jest.fn(() => null),
}));

describe("InputDateWebComp", () => {
  it("deve renderizar o label quando fornecido", () => {
    const { getByText } = render(
      <InputDateComp
        label="Data de nascimento"
        value={null}
        onPress={jest.fn()}
      />
    );

    expect(getByText("Data de nascimento")).toBeTruthy();
  });

  it("deve renderizar o placeholder quando value for null", () => {
    const { getByText } = render(
      <InputDateComp
        value={null}
        placeholder="Selecionar data"
        onPress={jest.fn()}
      />
    );

    expect(getByText("Selecionar data")).toBeTruthy();
  });

  it("deve renderizar um valor quando fornecido", () => {
    const { getByText } = render(
      <InputDateComp value="10/05/2025" onPress={jest.fn()} />
    );

    // O valor pode ser formatado internamente no Web
    expect(getByText(/\/|:/)).toBeTruthy();
  });


  it("deve exibir statusText quando statusText for passado", () => {
    const { getByText } = render(
      <InputDateComp
        label="Data"
        value={null}
        status={true}
        statusText="Data inválida"
        onPress={jest.fn()}
      />
    );

    expect(getByText("Data inválida")).toBeTruthy();
  });

  it("deve renderizar o ícone de calendário", () => {
    render(
      <InputDateComp
        value={null}
        onPress={jest.fn()}
      />
    );

    // Como o Ionicons foi mockado, verificamos se foi chamado
    const { Ionicons } = require("@expo/vector-icons");
    expect(Ionicons).toHaveBeenCalled();
  });
});
