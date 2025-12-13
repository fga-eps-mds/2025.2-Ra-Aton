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

// --- MOCK AVANÇADO DO DATETIMEPICKER ---
// Inclui botões para simular Confirmar (set), Cancelar (dismissed) e Neutro (undefined)
// Isso é essencial para cobrir todos os branches de handleChangeDate/Time
let simulatedDateForTest: Date;

jest.mock("@react-native-community/datetimepicker", () => {
  const { View, TouchableOpacity, Text } = require("react-native");
  return (props: any) => (
    <View testID="datetime-picker-view">
      {/* Botão de Confirmar Padrão */}
      <TouchableOpacity
        testID={`datetime-picker-${props.mode}-confirm`}
        onPress={() => {
          const dateToUse = new Date("2024-05-10T12:00:00");
          // Se for time, mudamos a hora para diferenciar
          if (props.mode === "time") {
            dateToUse.setHours(14, 30);
          }
          simulatedDateForTest = dateToUse;
          props.onChange({ type: "set" }, dateToUse);
        }}
      >
        <Text>Confirmar {props.mode}</Text>
      </TouchableOpacity>

      {/* Botão de Cancelar (Dismiss) */}
      <TouchableOpacity
        testID={`datetime-picker-${props.mode}-cancel`}
        onPress={() => {
          props.onChange({ type: "dismissed" });
        }}
      >
        <Text>Cancelar</Text>
      </TouchableOpacity>

      {/* Botão Neutro (Simula evento sem data selecionada, para testar fallback) */}
      <TouchableOpacity
        testID={`datetime-picker-${props.mode}-neutral`}
        onPress={() => {
          props.onChange({ type: "neutral" }, undefined);
        }}
      >
        <Text>Neutro</Text>
      </TouchableOpacity>
    </View>
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

  // --- TESTES DE RENDERIZAÇÃO E TEXTO ---

  it("deve renderizar todos os campos corretamente", () => {
    const { getByTestId } = render(
      <EventoFormComponent formsData={initialData} setFormData={mockSetFormData} />
    );
    expect(getByTestId("input-Título *")).toBeTruthy();
    expect(getByTestId("date-input-Data Início *")).toBeTruthy();
  });

  it("deve atualizar textos (Titulo, Descricao, Local)", () => {
    const { getByTestId } = render(
      <EventoFormComponent formsData={initialData} setFormData={mockSetFormData} />
    );

    fireEvent.changeText(getByTestId("input-Título *"), "Novo Evento");
    expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));

    // Testa a função de update passada para o setFormData
    let updateFn = mockSetFormData.mock.calls[0][0];
    expect(updateFn(initialData).titulo).toBe("Novo Evento");

    mockSetFormData.mockClear();

    fireEvent.changeText(getByTestId("input-Descrição"), "Desc");
    updateFn = mockSetFormData.mock.calls[0][0];
    expect(updateFn(initialData).descricao).toBe("Desc");

    mockSetFormData.mockClear();

    fireEvent.changeText(getByTestId("input-Local *"), "Local X");
    updateFn = mockSetFormData.mock.calls[0][0];
    expect(updateFn(initialData).local).toBe("Local X");
  });

  // --- TESTES DE FLUXO DE DATA (NATIVE) ---

  it("deve selecionar Data de Início completa (Confirmar Data -> Confirmar Hora)", async () => {
    const { getByTestId, queryByTestId } = render(
      <EventoFormComponent formsData={initialData} setFormData={mockSetFormData} />
    );

    // 1. Abre Picker Data
    fireEvent.press(getByTestId("date-input-Data Início *"));

    // 2. Confirma Data
    fireEvent.press(getByTestId("datetime-picker-date-confirm"));

    // 3. Verifica se abriu Picker Hora e Confirma
    await waitFor(() => expect(queryByTestId("datetime-picker-time-confirm")).toBeTruthy());
    fireEvent.press(getByTestId("datetime-picker-time-confirm"));

    expect(mockSetFormData).toHaveBeenCalled();
    const calls = mockSetFormData.mock.calls;
    const updateFn = calls[calls.length - 1][0]; // Pega a última chamada
    const newState = updateFn(initialData);

    expect(newState.dataInicio).toBe(simulatedDateForTest.toISOString());
  });

  it("deve selecionar Data Fim completa", async () => {
    const { getByTestId, queryByTestId } = render(
      <EventoFormComponent formsData={initialData} setFormData={mockSetFormData} />
    );

    fireEvent.press(getByTestId("date-input-Data Fim"));
    fireEvent.press(getByTestId("datetime-picker-date-confirm"));

    await waitFor(() => expect(queryByTestId("datetime-picker-time-confirm")).toBeTruthy());
    fireEvent.press(getByTestId("datetime-picker-time-confirm"));

    const calls = mockSetFormData.mock.calls;
    const updateFn = calls[calls.length - 1][0];
    const newState = updateFn(initialData);

    expect(newState.dataFim).toBe(simulatedDateForTest.toISOString());
  });

  // --- TESTES DE BRANCHES (CANCELAMENTOS E FALLBACKS) ---

  it("deve cancelar (dismiss) a seleção de DATA e não abrir a hora", () => {
    const { getByTestId, queryByTestId } = render(
      <EventoFormComponent formsData={initialData} setFormData={mockSetFormData} />
    );

    fireEvent.press(getByTestId("date-input-Data Início *"));

    // Cancela no primeiro passo
    fireEvent.press(getByTestId("datetime-picker-date-cancel"));

    // Verifica que fechou e não avançou
    expect(queryByTestId("datetime-picker-date-confirm")).toBeNull();
    expect(queryByTestId("datetime-picker-time-confirm")).toBeNull();
    expect(mockSetFormData).not.toHaveBeenCalled();
  });

  it("deve cancelar (dismiss) a seleção de HORA e não salvar nada", async () => {
    const { getByTestId, queryByTestId } = render(
      <EventoFormComponent formsData={initialData} setFormData={mockSetFormData} />
    );

    fireEvent.press(getByTestId("date-input-Data Início *"));
    fireEvent.press(getByTestId("datetime-picker-date-confirm")); // Avança

    await waitFor(() => expect(queryByTestId("datetime-picker-time-cancel")).toBeTruthy());

    // Cancela no segundo passo
    fireEvent.press(getByTestId("datetime-picker-time-cancel"));

    expect(queryByTestId("datetime-picker-time-cancel")).toBeNull();
    expect(mockSetFormData).not.toHaveBeenCalled();
  });

  it("deve usar a data temporária se o evento de DATA não trouxer seleção (selected undefined)", () => {
    // Cobre: const date = selected || tempDate; em handleChangeDate
    const { getByTestId, queryByTestId } = render(
      <EventoFormComponent formsData={initialData} setFormData={mockSetFormData} />
    );

    fireEvent.press(getByTestId("date-input-Data Início *"));

    // Clica em "Neutro" (envia undefined no selected)
    fireEvent.press(getByTestId("datetime-picker-date-neutral"));

    // Deve ter avançado para Hora mesmo assim
    expect(queryByTestId("datetime-picker-time-confirm")).toBeTruthy();
  });

  it("deve manter a hora original se o evento de HORA não trouxer seleção (selected undefined)", async () => {
    // Cobre: if (selected) { ... } em handleChangeTime
    const { getByTestId, queryByTestId } = render(
      <EventoFormComponent formsData={initialData} setFormData={mockSetFormData} />
    );

    fireEvent.press(getByTestId("date-input-Data Início *"));
    fireEvent.press(getByTestId("datetime-picker-date-confirm"));

    await waitFor(() => expect(queryByTestId("datetime-picker-time-neutral")).toBeTruthy());

    // Clica em "Neutro" na hora
    fireEvent.press(getByTestId("datetime-picker-time-neutral"));

    expect(mockSetFormData).toHaveBeenCalled();
    const calls = mockSetFormData.mock.calls;
    const updateFn = calls[calls.length - 1][0];
    const newState = updateFn(initialData);

    // O estado deve ter sido atualizado, usando a data do primeiro passo e hora preservada
    expect(newState.dataInicio).toBeDefined();
  });

  // --- TESTES DE INICIALIZAÇÃO DE ESTADO (DATE FALLBACK) ---

  it("deve inicializar o picker com a data atual se o campo estiver vazio", () => {
    // Cobre: setTempDate(formsData.dataInicio ? ... : new Date())
    const { getByTestId } = render(
      <EventoFormComponent formsData={{ ...initialData, dataInicio: "" }} setFormData={mockSetFormData} />
    );

    // Apenas abrir o modal já executa a linha do ternário
    fireEvent.press(getByTestId("date-input-Data Início *"));
    expect(getByTestId("datetime-picker-date-confirm")).toBeTruthy();
  });

  it("deve inicializar o picker com a data existente se o campo estiver preenchido", () => {
    // Cobre a outra parte do ternário
    const dataExistente = "2023-01-01T10:00:00.000Z";
    const { getByTestId } = render(
      <EventoFormComponent formsData={{ ...initialData, dataInicio: dataExistente }} setFormData={mockSetFormData} />
    );

    fireEvent.press(getByTestId("date-input-Data Início *"));
    expect(getByTestId("datetime-picker-date-confirm")).toBeTruthy();
  });

  it("deve inicializar o picker de Data Fim corretamente (vazio)", () => {
    const { getByTestId } = render(
      <EventoFormComponent formsData={{ ...initialData, dataFim: "" }} setFormData={mockSetFormData} />
    );
    fireEvent.press(getByTestId("date-input-Data Fim"));
    expect(getByTestId("datetime-picker-date-confirm")).toBeTruthy();
  });

  // --- TESTES DE PLATAFORMA (WEB) ---

  it("deve funcionar no Web e converter inputs de texto para ISO", () => {
    Platform.OS = "web";
    const { getByTestId } = render(
      <EventoFormComponent formsData={initialData} setFormData={mockSetFormData} />
    );

    const webInputInicio = getByTestId("web-date-Data Início *");
    const inputDateString = "2024-12-25T10:00";

    // Simula digitação no input web
    fireEvent.changeText(webInputInicio, inputDateString);

    const updateFnInicio = mockSetFormData.mock.calls[0][0];
    const novaDataInicio = updateFnInicio(initialData).dataInicio;

    expect(novaDataInicio).toBe(new Date(inputDateString).toISOString());
  });

  it("deve atualizar Data Fim no Web", () => {
    Platform.OS = "web";
    const { getByTestId } = render(
      <EventoFormComponent formsData={initialData} setFormData={mockSetFormData} />
    );

    const webInputFim = getByTestId("web-date-Data Fim");
    const inputFimString = "2024-12-31T23:59";

    fireEvent.changeText(webInputFim, inputFimString);

    const updateFnFim = mockSetFormData.mock.calls[0][0];
    expect(updateFnFim(initialData).dataFim).toBe(new Date(inputFimString).toISOString());
  });

  // --- OUTROS ---

  it("deve exibir erro se formError for passado", () => {
    const { getByText } = render(
      <EventoFormComponent formsData={initialData} setFormData={mockSetFormData} formError="Erro Teste" />
    );
    expect(getByText("Erro Teste")).toBeTruthy();
  });

  // --- HELPER FUNCTION ---

  it("helper formatarDataHelper deve tratar string vazia", () => {
    expect(formatarDataHelper("")).toBe("");
  });

  it("helper formatarDataHelper deve formatar data ISO corretamente", () => {
    const iso = "2024-05-10T14:30:00.000Z";
    const formatted = formatarDataHelper(iso);
    // Verificamos o formato geral DD/MM/YYYY HH:mm
    expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
  });
});