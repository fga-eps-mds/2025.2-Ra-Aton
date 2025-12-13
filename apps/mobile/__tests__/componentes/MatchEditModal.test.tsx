import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { MatchEditModal } from "@/components/MatchEditModal";
import { useTheme } from "@/constants/Theme";
import { Platform } from "react-native";

// --- MOCKS ---

jest.mock("@/constants/Theme", () => ({
  useTheme: jest.fn(),
}));

// Mock dos Inputs para controle total
jest.mock("@/components/InputComp", () => {
  const { View, Text, TextInput } = require("react-native");
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

jest.mock("@/components/DescricaoInput", () => ({
  DescricaoInput: (props: any) => {
    const { View, Text, TextInput } = require("react-native");
    return (
      <View>
        <Text>{props.label}</Text>
        <TextInput
          testID={`input-${props.label}`}
          value={props.value}
          onChangeText={props.onChangeText}
          multiline
        />
        {props.status && <Text>{props.statusText}</Text>}
      </View>
    );
  },
}));

jest.mock("@/components/InputDateComp", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return (props: any) => (
    <TouchableOpacity onPress={props.onPress} testID="date-input-mobile">
      <Text>{props.value || "Selecionar Data"}</Text>
      {props.status && <Text>{props.statusText}</Text>}
    </TouchableOpacity>
  );
});

jest.mock("@/components/InputDateWebComp", () => {
  const { View, Text, TextInput } = require("react-native");
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

jest.mock("@/components/PrimaryButton", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return (props: any) => (
    <TouchableOpacity 
      onPress={props.onPress} 
      disabled={props.disabled}
      testID="primary-button"
    >
      <Text>{props.children}</Text>
    </TouchableOpacity>
  );
});

jest.mock("@/components/SecondaryButton", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return (props: any) => (
    <TouchableOpacity 
      onPress={props.onPress} 
      disabled={props.disabled}
      testID="secondary-button"
    >
      <Text>{props.children}</Text>
    </TouchableOpacity>
  );
});

// --- MOCK DO DATETIMEPICKER ---
let simulatedDateForTest: Date;

jest.mock("@react-native-community/datetimepicker", () => {
  const { View, TouchableOpacity, Text } = require("react-native");
  return (props: any) => (
    <View>
      <TouchableOpacity
        testID={`datetime-picker-${props.mode}-confirm`}
        onPress={() => {
          const dateToUse = new Date("2023-12-25T14:30:00");
          if (props.mode === "time") {
             dateToUse.setHours(16, 45); 
          }
          simulatedDateForTest = dateToUse;
          props.onChange({ type: "set" }, dateToUse);
        }}
      >
        <Text>Confirmar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        testID={`datetime-picker-${props.mode}-cancel`}
        onPress={() => {
          props.onChange({ type: "dismissed" });
        }}
      >
        <Text>Cancelar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        testID={`datetime-picker-${props.mode}-neutral`}
        onPress={() => {
          props.onChange({ type: "set" }, undefined);
        }}
      >
        <Text>Neutro</Text>
      </TouchableOpacity>
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
    Platform.OS = "ios";
  });

  // --- 1. RENDERIZAÇÃO E INICIALIZAÇÃO ---

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
    
    // Verificação flexível da data para evitar erro de fuso horário
    // O dia/mês/ano deve ser 10/10/2023. A hora pode variar (11:00 ou 14:00)
    const dateText = getByTestId("date-input-mobile").props.children[0].props.children;
    expect(dateText).toContain("10/10/2023");
    // Verifica se tem hora e minuto no formato HH:MM
    expect(dateText).toMatch(/\d{2}:\d{2}/);
  });

  it("deve lidar com match sendo undefined/null na inicialização (valores padrão)", () => {
    const { getByTestId } = render(
        <MatchEditModal visible={true} onClose={mockOnClose} match={undefined} />
    );
    // Quando editData é {}, o value é undefined. 
    // O componente InputComp mockado recebe value={editData.title} -> value={undefined}
    // O TextInput do React Native aceita undefined (exibe vazio), mas para o teste ser preciso:
    expect(getByTestId("input-Título").props.value).toBeUndefined(); 
  });

  // --- 2. ATUALIZAÇÃO DE INPUTS ---

  it("deve atualizar inputs de texto simples e salvar com novos valores", async () => {
    const { getByTestId } = render(
      <MatchEditModal visible={true} onClose={mockOnClose} onSave={mockOnSave} match={mockMatch} />
    );

    fireEvent.changeText(getByTestId("input-Título"), "Novo Título");
    fireEvent.changeText(getByTestId("input-Esporte"), "Vôlei");
    fireEvent.changeText(getByTestId("input-Local"), "Praia");
    fireEvent.changeText(getByTestId("input-Descrição"), "Nova Descrição");
    fireEvent.changeText(getByTestId("input-Nome da Equipe 1"), "Alfa");
    fireEvent.changeText(getByTestId("input-Nome da Equipe 2"), "Beta");
    
    mockOnSave.mockResolvedValue({ success: true });
    fireEvent.press(getByTestId("primary-button"));

    await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
            title: "Novo Título",
            sport: "Vôlei",
            location: "Praia",
            description: "Nova Descrição",
            teamNameA: "Alfa",
            teamNameB: "Beta"
        }));
    });
  });

  it("deve filtrar caracteres não numéricos em campos numéricos", async () => {
    mockOnSave.mockResolvedValue({ success: true });
    
    const { getByTestId, getByText } = render(
      <MatchEditModal visible={true} onClose={mockOnClose} onSave={mockOnSave} match={mockMatch} />
    );

    fireEvent.changeText(getByTestId("input-Número de Participantes"), "20abc"); // -> 20
    fireEvent.changeText(getByTestId("input-Pontuação - Equipe 1"), "3x");       // -> 3
    fireEvent.changeText(getByTestId("input-Pontuação - Equipe 2"), "y1");       // -> 1

    fireEvent.press(getByText("Salvar"));

    await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
            maxPlayers: 20,
            teamAScore: "3",
            teamBScore: "1"
        }));
    });
  });

  // --- 3. VALIDAÇÃO (BRANCHES DE ERRO) ---

  it("deve falhar validação para campos vazios ou curtos", async () => {
    const invalidMatch = { 
        ...mockMatch, 
        title: "A", // < 2
        sport: "", 
        location: "", 
        MatchDate: "", 
        description: "Oi", // < 3
        maxPlayers: "1" // < 2
    };
    
    const { getByText, getByTestId } = render(
      <MatchEditModal
        visible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        match={invalidMatch}
      />
    );

    fireEvent.press(getByTestId("primary-button"));

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
      expect(getByText("Título deve ter no mínimo 2 caracteres.")).toBeTruthy();
      expect(getByText("Informe o esporte.")).toBeTruthy();
      expect(getByText("Informe o local da partida.")).toBeTruthy();
      expect(getByText("Informe a data da partida.")).toBeTruthy();
      expect(getByText("O número de participantes deve ser >= 2.")).toBeTruthy();
      expect(getByText("Descrição deve ter no mínimo 3 caracteres.")).toBeTruthy();
    });
  });

  // --- 4. FLUXO DE DATA (DATEPICKER) ---

  it("deve confirmar DATA e HORA corretamente (Fluxo Feliz)", async () => {
    const { getByTestId, queryByTestId, getByText } = render(
      <MatchEditModal visible={true} onClose={mockOnClose} match={mockMatch} />
    );

    // Abre Data
    fireEvent.press(getByTestId("date-input-mobile"));
    
    // Confirma Data (25/12/2023)
    fireEvent.press(getByTestId("datetime-picker-date-confirm"));
    
    // Aguarda e Confirma Hora (16:45)
    await waitFor(() => expect(queryByTestId("datetime-picker-time-confirm")).toBeTruthy());
    fireEvent.press(getByTestId("datetime-picker-time-confirm"));

    // Verifica update visual - regex para data/hora
    await waitFor(() => {
        const dateText = getByTestId("date-input-mobile").props.children[0].props.children;
        expect(dateText).toMatch(/25\/12\/2023 \d{2}:\d{2}/);
    });
  });

  it("deve lidar com cancelamento (dismissed) na DATA", () => {
    const { getByTestId, queryByTestId } = render(
      <MatchEditModal visible={true} onClose={mockOnClose} match={mockMatch} />
    );

    fireEvent.press(getByTestId("date-input-mobile"));
    fireEvent.press(getByTestId("datetime-picker-date-cancel"));

    // Hora não deve abrir
    expect(queryByTestId("datetime-picker-time-confirm")).toBeNull();
  });

  it("deve lidar com cancelamento (dismissed) na HORA", async () => {
    const { getByTestId, queryByTestId } = render(
      <MatchEditModal visible={true} onClose={mockOnClose} match={mockMatch} />
    );

    fireEvent.press(getByTestId("date-input-mobile"));
    fireEvent.press(getByTestId("datetime-picker-date-confirm"));
    
    await waitFor(() => expect(queryByTestId("datetime-picker-time-cancel")).toBeTruthy());
    fireEvent.press(getByTestId("datetime-picker-time-cancel"));

    expect(queryByTestId("datetime-picker-time-cancel")).toBeNull();
  });

  it("deve usar 'tempDate' se selecionar DATA 'neutra' (undefined selectedDate)", () => {
    const { getByTestId, queryByTestId } = render(
      <MatchEditModal visible={true} onClose={mockOnClose} match={mockMatch} />
    );

    fireEvent.press(getByTestId("date-input-mobile"));
    fireEvent.press(getByTestId("datetime-picker-date-neutral"));

    // Deve avançar para Hora mesmo sem data nova selecionada
    expect(queryByTestId("datetime-picker-time-confirm")).toBeTruthy();
  });

  it("deve ignorar atualização de hora se selecionar HORA 'neutra' (undefined selectedTime)", async () => {
    const { getByTestId, queryByTestId } = render(
      <MatchEditModal visible={true} onClose={mockOnClose} match={mockMatch} />
    );

    fireEvent.press(getByTestId("date-input-mobile"));
    fireEvent.press(getByTestId("datetime-picker-date-confirm"));
    
    await waitFor(() => expect(queryByTestId("datetime-picker-time-neutral")).toBeTruthy());
    fireEvent.press(getByTestId("datetime-picker-time-neutral"));

    expect(queryByTestId("datetime-picker-time-neutral")).toBeNull();
  });

  // --- 5. PLATAFORMA WEB ---

  it("deve atualizar data via InputDateWebComp na Web", () => {
    Platform.OS = "web";
    const { getByTestId } = render(
      <MatchEditModal visible={true} onClose={mockOnClose} match={mockMatch} />
    );

    const inputWeb = getByTestId("date-input-web");
    const newDateISO = "2024-01-01T12:00:00.000Z";
    fireEvent.changeText(inputWeb, newDateISO);
    
    expect(inputWeb.props.value).toBe("2024-01-01T12:00"); // Slice(0, 16)
  });

  // --- 6. TRATAMENTO DE ERROS DE SALVAMENTO ---

  it("deve lidar com erro de validação do backend (field específico)", async () => {
    mockOnSave.mockResolvedValue({ success: false, field: "title", error: "Duplicado" });
    const { getByText, getByTestId } = render(
      <MatchEditModal visible={true} onClose={mockOnClose} onSave={mockOnSave} match={mockMatch} />
    );

    fireEvent.press(getByTestId("primary-button"));

    await waitFor(() => {
      expect(getByText("Duplicado")).toBeTruthy();
    });
  });

  it("deve lidar com erro genérico do backend (sem field e sem error msg)", async () => {
    mockOnSave.mockResolvedValue({ success: false, field: null, error: null });
    const { getByTestId } = render(
      <MatchEditModal visible={true} onClose={mockOnClose} onSave={mockOnSave} match={mockMatch} />
    );

    fireEvent.press(getByTestId("primary-button"));
    await waitFor(() => expect(mockOnClose).not.toHaveBeenCalled());
  });

  it("deve tratar exceção (catch) durante salvamento", async () => {
    mockOnSave.mockRejectedValue(new Error("Rede"));
    const { getByTestId } = render(
      <MatchEditModal visible={true} onClose={mockOnClose} onSave={mockOnSave} match={mockMatch} />
    );

    fireEvent.press(getByTestId("primary-button"));
    await waitFor(() => expect(mockOnClose).not.toHaveBeenCalled());
  });

  it("não deve explodir se onSave não for passado (Branch: if (!onSave) return)", () => {
    const { getByTestId } = render(
      <MatchEditModal visible={true} onClose={mockOnClose} match={mockMatch} />
    );

    fireEvent.press(getByTestId("primary-button"));
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  // --- 7. INTERAÇÕES ---

  it("deve fechar ao clicar em Cancelar", () => {
    const { getByTestId } = render(
      <MatchEditModal visible={true} onClose={mockOnClose} match={mockMatch} />
    );
    fireEvent.press(getByTestId("secondary-button"));
    expect(mockOnClose).toHaveBeenCalled();
  });
});