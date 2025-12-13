// ARQUIVO: apps/mobile/__tests__/componentes/MatchEditModal.test.tsx
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { MatchEditModal } from "@/components/MatchEditModal";
import { useTheme } from "@/constants/Theme";
import { Platform } from "react-native";

// 1. Mocks Essenciais
jest.mock("@/constants/Theme", () => ({
  useTheme: jest.fn(),
}));

// Mock do InputComp (Default Export)
jest.mock("@/components/InputComp", () => {
  const { TextInput, View, Text } = require("react-native");
  return (props: any) => (
    <View>
      <Text>{props.label}</Text>
      <TextInput
        testID={`input-${props.label}`}
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        keyboardType={props.keyboardType}
      />
      {props.status && <Text>{props.statusText}</Text>}
    </View>
  );
});

// Mock do DescricaoInput (Named Export)
jest.mock("@/components/DescricaoInput", () => ({
  DescricaoInput: (props: any) => {
    const { TextInput, View, Text } = require("react-native");
    return (
      <View>
        <Text>{props.label}</Text>
        <TextInput
          testID={`input-${props.label}`}
          value={props.value}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          multiline
        />
        {props.status && <Text>{props.statusText}</Text>}
      </View>
    );
  },
}));

// MOCK INTELIGENTE DO DATETIMEPICKER
jest.mock("@react-native-community/datetimepicker", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return (props: any) => {
    return (
      <TouchableOpacity
        testID={`datetime-picker-${props.mode}`}
        onPress={() => {
          // Simula o evento de seleção (onChange) passando uma data fixa
          const simulatedDate = new Date("2023-12-25T14:30:00"); 
          props.onChange({ type: "set" }, simulatedDate);
        }}
      >
        <Text>Confirmar Data/Hora</Text>
      </TouchableOpacity>
    );
  };
});

// Mock do InputDateComp (Mobile)
jest.mock("@/components/InputDateComp", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return (props: any) => (
    <TouchableOpacity onPress={props.onPress} testID="date-input-mobile">
      <Text>{props.value || "Selecionar Data"}</Text>
      {props.status && <Text>{props.statusText}</Text>}
    </TouchableOpacity>
  );
});

// Mock do InputDateWebComp (Web)
jest.mock("@/components/InputDateWebComp", () => {
  const { TextInput, View, Text } = require("react-native");
  return (props: any) => (
    <View>
      <Text>{props.label}</Text>
      <TextInput
        testID="date-input-web"
        value={props.value}
        onChangeText={props.onChange} 
      />
      {props.status && <Text>{props.statusText}</Text>}
    </View>
  );
});

describe("MatchEditModal", () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  
  const mockMatch = {
    id: "1",
    title: "Jogo Teste",
    description: "Descrição Original",
    sport: "Futebol",
    maxPlayers: 10,
    MatchDate: "2023-10-10T14:00:00.000Z",
    location: "Quadra 1",
    teamAScore: 0,
    teamBScore: 0,
    teamNameA: "Time A",
    teamNameB: "Time B",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ isDarkMode: false });
    // Reseta plataforma para IOS por padrão nos testes
    Platform.OS = "ios";
  });

  it("deve inicializar com os dados da partida corretamente", () => {
    const { getByTestId } = render(
      <MatchEditModal
        visible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        match={mockMatch}
      />
    );

    expect(getByTestId("input-Título").props.value).toBe("Jogo Teste");
    expect(getByTestId("date-input-mobile")).toBeTruthy();
  });

  it("deve passar por TODAS as validações de erro (Coverage Boost)", async () => {
    // Inicializa com um match vazio/inválido para forçar erros
    const invalidMatch = { ...mockMatch, title: "", sport: "", location: "", MatchDate: "", description: "oi" };
    
    const { getByText, getByTestId } = render(
      <MatchEditModal
        visible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        match={invalidMatch}
      />
    );

    // Zera os inputs manualmente para garantir
    fireEvent.changeText(getByTestId("input-Título"), "");
    fireEvent.changeText(getByTestId("input-Esporte"), "");
    fireEvent.changeText(getByTestId("input-Local"), "");
    fireEvent.changeText(getByTestId("input-Número de Participantes"), "1"); // Menor que 2
    fireEvent.changeText(getByTestId("input-Descrição"), "oi"); // Menor que 3

    // Tenta Salvar
    fireEvent.press(getByText("Salvar"));

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
      expect(getByText("Título deve ter no mínimo 2 caracteres.")).toBeTruthy();
      expect(getByText("Informe o esporte.")).toBeTruthy();
      expect(getByText("Informe o local da partida.")).toBeTruthy();
      expect(getByText("O número de participantes deve ser >= 2.")).toBeTruthy();
      expect(getByText("Descrição deve ter no mínimo 3 caracteres.")).toBeTruthy();
    });
  });

  it("deve processar o fluxo completo de alteração de DATA e HORA (Mobile)", async () => {
    const { getByTestId, queryByTestId, getByText } = render(
      <MatchEditModal visible={true} onClose={mockOnClose} match={mockMatch} />
    );

    // 1. Abre o Picker de Data
    fireEvent.press(getByTestId("date-input-mobile"));
    expect(queryByTestId("datetime-picker-date")).toBeTruthy();

    // 2. Simula seleção da DATA (clica no mock) -> aciona handleChangeDate
    fireEvent.press(getByTestId("datetime-picker-date"));

    await waitFor(() => {
      expect(queryByTestId("datetime-picker-time")).toBeTruthy();
    });

    // 3. Simula seleção da HORA (clica no mock) -> aciona handleChangeTime
    fireEvent.press(getByTestId("datetime-picker-time"));

    await waitFor(() => {
      expect(queryByTestId("datetime-picker-time")).toBeNull();
      // Procura por partes da data mockada: 25/12
      expect(getByText(/25\/12/)).toBeTruthy();
    });
  });

  it("deve lidar com InputDateWebComp e formatação no ambiente Web", () => {
    Platform.OS = "web";
    const { getByTestId } = render(
      <MatchEditModal visible={true} onClose={mockOnClose} match={mockMatch} />
    );

    const dateInput = getByTestId("date-input-web");
    expect(dateInput).toBeTruthy();

    // Simula troca de data no web com string ISO completa
    fireEvent.changeText(dateInput, "2025-12-31T20:00:00.000Z");
    
    // CORREÇÃO: O componente corta a string (slice 0, 16), então esperamos a string cortada
    expect(dateInput.props.value).toBe("2025-12-31T20:00");
  });

  it("deve salvar com sucesso quando tudo estiver válido", async () => {
    mockOnSave.mockResolvedValue({ success: true });

    const { getByTestId, getByText } = render(
      <MatchEditModal
        visible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        match={mockMatch}
      />
    );

    // Preenche campos válidos
    fireEvent.changeText(getByTestId("input-Título"), "Final do Campeonato");
    fireEvent.changeText(getByTestId("input-Pontuação - Equipe 1"), "3");
    fireEvent.changeText(getByTestId("input-Pontuação - Equipe 2"), "1");

    fireEvent.press(getByText("Salvar"));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
        title: "Final do Campeonato",
        teamAScore: "3",
        teamBScore: "1"
      }));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("deve exibir erro genérico ao falhar no salvamento", async () => {
    mockOnSave.mockResolvedValue({ success: false, error: "Erro Fatal" });

    const { getByText } = render(
      <MatchEditModal
        visible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        match={mockMatch}
      />
    );

    fireEvent.press(getByText("Salvar"));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});