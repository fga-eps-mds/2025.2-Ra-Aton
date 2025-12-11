import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import EditarEventoScreen from "@/app/(DashBoard)/(tabs)/(edit)/editEvento";

// --- MOCKS VISUAIS SIMPLIFICADOS ---

// Mock para Default Exports que funciona sempre
jest.mock("@/components/BackGroundComp", () => {
  const { View } = require("react-native");
  return ({ children }: any) => <View testID="bg-mock">{children}</View>;
});

jest.mock("@/components/SpacerComp", () => {
  const { View } = require("react-native");
  return () => <View testID="spacer-mock" />;
});

jest.mock("@/components/AppText", () => {
  const { Text } = require("react-native");
  return (props: any) => <Text {...props}>{props.children}</Text>;
});

jest.mock("@/components/PrimaryButton", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return ({ onPress, children }: any) => (
    <TouchableOpacity onPress={onPress} testID="btn-salvar"><Text>{children}</Text></TouchableOpacity>
  );
});

jest.mock("@/components/SecondaryButton", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return ({ onPress, children }: any) => (
    <TouchableOpacity onPress={onPress} testID="btn-cancelar"><Text>{children}</Text></TouchableOpacity>
  );
});

// Named Exports
jest.mock("@/components/EventoFormComponent", () => ({
  EventoFormComponent: () => {
    const { Text } = require("react-native");
    return <Text>Formulário de Evento Mockado</Text>;
  }
}));

jest.mock("@/components/CustomAlertModalComp", () => ({
  CustomAlertModalComp: ({ visible, title }: any) => {
    const { Text } = require("react-native");
    return visible ? <Text>{title}</Text> : null;
  }
}));

// Mock Lógica
const mockHandleUpdate = jest.fn();
const mockHandleCancel = jest.fn();

jest.mock("@/libs/hooks/libs/EditHooks/useEditarEventLogic", () => ({
  useEditarEventoLogic: () => ({
    formsData: { titulo: "Evento" },
    setFormData: jest.fn(),
    formError: "",
    loading: false,
    isDisabled: false,
    alertConfig: { visible: false },
    closeAlert: jest.fn(),
    handleUpdate: mockHandleUpdate,
    handleCancel: mockHandleCancel
  })
}));

describe("Tela: EditarEventoScreen", () => {
  it("Renderiza e interage", () => {
    const { getByText, getByTestId } = render(<EditarEventoScreen />);
    
    expect(getByText("Editar Evento")).toBeTruthy();
    
    fireEvent.press(getByTestId("btn-salvar"));
    expect(mockHandleUpdate).toHaveBeenCalled();

    fireEvent.press(getByTestId("btn-cancelar"));
    expect(mockHandleCancel).toHaveBeenCalled();
  });
});