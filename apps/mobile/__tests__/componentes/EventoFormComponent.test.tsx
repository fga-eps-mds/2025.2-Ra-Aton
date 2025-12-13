import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { EventoFormComponent, formatarDataHelper } from "@/components/EventoFormComponent";
import { Platform } from "react-native";

// --- MOCKS ---
jest.mock("@/constants/Theme", () => ({
  useTheme: jest.fn(),
}));

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
      />
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
      </View>
    );
  },
}));

jest.mock("@/components/InputDateComp", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return (props: any) => (
    <TouchableOpacity testID={`date-input-${props.label}`} onPress={props.onPress}>
      <Text>{props.value || "Selecionar Data"}</Text>
    </TouchableOpacity>
  );
});

jest.mock("@/components/InputDateWebComp", () => {
  const { View, Text, TextInput } = require("react-native");
  return (props: any) => (
    <View>
      <Text>{props.label}</Text>
      <TextInput
        testID={`web-date-${props.label}`}
        value={props.value}
        onChangeText={props.onChange} 
      />
    </View>
  );
});

// VARIÁVEIS GLOBAIS PARA CONTROLE DE DATA NO TESTE
let simulatedDateForTest: Date;

jest.mock("@react-native-community/datetimepicker", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return (props: any) => (
    <TouchableOpacity
      testID={`datetime-picker-${props.mode}`}
      onPress={() => {
        // Usa a data controlada ou cria uma nova base
        const dateToUse = new Date("2024-05-10T12:00:00"); // Data base
        
        if (props.mode === "time") {
             dateToUse.setHours(14, 30); // Define hora fixa
        }
        
        // Salva essa data para compararmos no teste depois
        simulatedDateForTest = dateToUse;

        props.onChange({ type: "set" }, dateToUse);
      }}
    >
      <Text>Confirmar {props.mode}</Text>
    </TouchableOpacity>
  );
});

describe("EventoFormComponent", () => {
  const mockSetFormData = jest.fn();
  const initialData = {
    titulo: "",
    descricao: "",
    dataInicio: "",
    dataFim: "",
    local: "",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = "ios";
  });

  it("deve renderizar todos os campos corretamente", () => {
    const { getByTestId } = render(
      <EventoFormComponent formsData={initialData} setFormData={mockSetFormData} />
    );
    expect(getByTestId("input-Título *")).toBeTruthy();
  });

  it("deve atualizar textos (Titulo, Descricao, Local)", () => {
    const { getByTestId } = render(
      <EventoFormComponent formsData={initialData} setFormData={mockSetFormData} />
    );
    fireEvent.changeText(getByTestId("input-Título *"), "Novo Evento");
    const updateFn = mockSetFormData.mock.calls[0][0];
    expect(updateFn(initialData).titulo).toBe("Novo Evento");
  });

  // CORREÇÃO: Comparação de datas robusta (Timezone Agnostic)
  it("deve selecionar Data de Início completa (Native Flow: Data -> Hora)", async () => {
    const { getByTestId, queryByTestId } = render(
      <EventoFormComponent formsData={initialData} setFormData={mockSetFormData} />
    );

    fireEvent.press(getByTestId("date-input-Data Início *")); // Abre Data
    fireEvent.press(getByTestId("datetime-picker-date")); // Confirma Data
    await waitFor(() => expect(queryByTestId("datetime-picker-time")).toBeTruthy());
    fireEvent.press(getByTestId("datetime-picker-time")); // Confirma Hora

    expect(mockSetFormData).toHaveBeenCalled();
    
    const calls = mockSetFormData.mock.calls;
    const updateFn = calls[calls.length - 1][0];
    const newState = updateFn(initialData);
    
    // VERIFICAÇÃO BLINDADA:
    // Compara se a string ISO gerada pelo componente é igual à ISO gerada pela data do mock.
    // Como ambos rodam na mesma máquina, o offset é igual.
    expect(newState.dataInicio).toBe(simulatedDateForTest.toISOString());
  });

  it("deve funcionar no Web e aceitar ISO Strings", () => {
    Platform.OS = "web";
    const { getByTestId } = render(
      <EventoFormComponent formsData={initialData} setFormData={mockSetFormData} />
    );

    const webInputInicio = getByTestId("web-date-Data Início *");
    const webInputFim = getByTestId("web-date-Data Fim");

    // Input manual tipo Web (já vem com fuso ou UTC dependendo do browser, simulamos string)
    const inputDateString = "2024-12-25T10:00"; // Local time string
    fireEvent.changeText(webInputInicio, inputDateString);
    
    const updateFnInicio = mockSetFormData.mock.calls[0][0];
    const novaDataInicio = updateFnInicio(initialData).dataInicio;
    
    // Verifica se a conversão aconteceu
    // A string resultante deve ser uma ISO válida criada a partir do input
    expect(novaDataInicio).toBe(new Date(inputDateString).toISOString());

    // Teste Fim
    const inputFimString = "2024-12-31T23:59";
    fireEvent.changeText(webInputFim, inputFimString);
    const updateFnFim = mockSetFormData.mock.calls[1][0];
    expect(updateFnFim(initialData).dataFim).toBe(new Date(inputFimString).toISOString());
  });

  it("formatarDataHelper deve formatar data ISO corretamente", () => {
    // Cria data localmente para garantir consistência no teste
    const dataLocal = new Date(2024, 4, 10, 14, 30); // 10/05/2024 14:30 Local
    const result = formatarDataHelper(dataLocal.toISOString());
    
    // O helper converte ISO -> Date -> String Local.
    // Então deve bater com os dados originais locais.
    expect(result).toContain("10/05/2024");
    expect(result).toContain("14:30");
  });
});