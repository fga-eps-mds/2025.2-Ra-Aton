import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { EventoFormComponent, formatarDataHelper } from "@/components/EventoFormComponent";

jest.mock("@react-native-community/datetimepicker", () => {
  const { View, Text, Pressable } = require("react-native");

  return ({ testID, onChange, mode }) => {
    const id = testID || `mockDatePicker-${mode}`;

    return (
      <View testID={id}>
        <Text>{`MockDatePicker (${mode})`}</Text>

        <Pressable
          testID={`${id}-set`}
          onPress={() => onChange({ type: "set" }, new Date("2024-01-01T12:00"))}
        >
          <Text>SET</Text>
        </Pressable>

        <Pressable
          testID={`${id}-dismiss`}
          onPress={() => onChange({ type: "dismissed" })}
        >
          <Text>DISMISS</Text>
        </Pressable>
      </View>
    );
  };
});

describe("EventoFormComponent", () => {
  const initialData = {
    titulo: "",
    descricao: "",
    dataInicio: "",
    dataFim: "",
    local: "",
  };

  const setFormDataMock = jest.fn();
  afterEach(() => jest.clearAllMocks());

  // -----------------------------------------------------------
  test("formatarDataHelper formata corretamente", () => {
    const result = formatarDataHelper("2024-01-10T14:30");
    expect(result).toBe("10/01/2024 14:30");
  });

  // -----------------------------------------------------------
  test("altera título corretamente", () => {
    const { getByLabelText } = render(
      <EventoFormComponent formsData={initialData} setFormData={setFormDataMock} />
    );

    const input = getByLabelText("Título *");
    fireEvent.changeText(input, "Evento Teste");

    expect(setFormDataMock).toHaveBeenCalled();

    const fn = setFormDataMock.mock.calls[0][0];
    const newState = fn(initialData);

    expect(newState.titulo).toBe("Evento Teste");
  });

  // -----------------------------------------------------------
  test("abre DatePicker ao clicar em Data Início", () => {
    const { getAllByText, getByTestId } = render(
      <EventoFormComponent formsData={initialData} setFormData={setFormDataMock} />
    );

    fireEvent.press(getAllByText("Selecionar data")[0]);

    expect(getByTestId("mockDatePicker-date")).toBeTruthy();
  });

  // -----------------------------------------------------------
  test("seleciona data e hora para dataInicio", () => {
    const { getAllByText, getByTestId } = render(
      <EventoFormComponent formsData={initialData} setFormData={setFormDataMock} />
    );

    fireEvent.press(getAllByText("Selecionar data")[0]);

    fireEvent.press(getByTestId("mockDatePicker-date-set"));
    fireEvent.press(getByTestId("mockDatePicker-time-set"));

    expect(setFormDataMock).toHaveBeenCalled();

    const fn = setFormDataMock.mock.calls[0][0];
    const newState = fn(initialData);

    expect(newState.dataInicio).toBe("2024-01-01T15:00:00.000Z");
  });

  // -----------------------------------------------------------
  test("seleciona data e hora para dataFim", () => {
    const { getAllByText, getByTestId } = render(
      <EventoFormComponent formsData={initialData} setFormData={setFormDataMock} />
    );

    fireEvent.press(getAllByText("Selecionar data")[1]);

    fireEvent.press(getByTestId("mockDatePicker-date-set"));
    fireEvent.press(getByTestId("mockDatePicker-time-set"));

    expect(setFormDataMock).toHaveBeenCalled();

    const fn = setFormDataMock.mock.calls[0][0];
    const newState = fn(initialData);

    expect(newState.dataFim).toBe("2024-01-01T15:00:00.000Z");
  });

  // -----------------------------------------------------------
  test("fecha datePicker quando usuário cancela", () => {
    const { getAllByText, queryByTestId, getByTestId } = render(
      <EventoFormComponent formsData={initialData} setFormData={setFormDataMock} />
    );

    fireEvent.press(getAllByText("Selecionar data")[0]);

    fireEvent.press(getByTestId("mockDatePicker-date-dismiss"));

    expect(queryByTestId("mockDatePicker-date")).toBeNull();
  });
});
