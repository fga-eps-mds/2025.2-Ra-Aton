import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import EditarEventoScreen from "@/app/(DashBoard)/(tabs)/(edit)/editEvento";

// --- MOCKS VISUAIS ---

jest.mock("@/components/BackGroundComp", () => ({
  __esModule: true,
  default: ({ children }: any) => {
    const { View } = require("react-native");
    return <View>{children}</View>;
  },
}));

jest.mock("@/components/SpacerComp", () => ({
  __esModule: true,
  default: () => {
    const { View } = require("react-native");
    return <View />;
  },
}));

jest.mock("@/components/AppText", () => ({
  __esModule: true,
  default: (props: any) => {
    const { Text } = require("react-native");
    return <Text {...props}>{props.children}</Text>;
  },
}));

jest.mock("@/components/EventoFormComponent", () => ({
  EventoFormComponent: () => {
    const { View, Text } = require("react-native");
    return (
      <View>
        <Text>Formulário de Evento Mockado</Text>
      </View>
    );
  }
}));

jest.mock("@/components/CustomAlertModalComp", () => ({
  CustomAlertModalComp: ({ visible, title }: any) => {
    const { View, Text } = require("react-native");
    if (!visible) return null;
    return (
      <View>
        <Text>{title}</Text>
      </View>
    );
  }
}));

jest.mock("@/components/PrimaryButton", () => ({
  __esModule: true,
  default: ({ onPress, children, disabled }: any) => {
    const { TouchableOpacity, Text } = require("react-native");
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} testID="btn-salvar">
        <Text>{children}</Text>
      </TouchableOpacity>
    );
  }
}));

jest.mock("@/components/SecondaryButton", () => ({
  __esModule: true,
  default: ({ onPress, children }: any) => {
    const { TouchableOpacity, Text } = require("react-native");
    return (
      <TouchableOpacity onPress={onPress} testID="btn-cancelar">
        <Text>{children}</Text>
      </TouchableOpacity>
    );
  }
}));

// --- MOCK DE LÓGICA ---
const mockHandleUpdate = jest.fn();
const mockHandleCancel = jest.fn();

jest.mock("@/libs/hooks/libs/EditHooks/useEditarEventLogic", () => ({
  useEditarEventoLogic: () => ({
    formsData: { titulo: "Evento Teste" },
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("1. Deve renderizar os elementos principais da tela", () => {
    const { getByText } = render(<EditarEventoScreen />);

    expect(getByText("Editar Evento")).toBeTruthy();
    expect(getByText("Formulário de Evento Mockado")).toBeTruthy();
    expect(getByText("Salvar Evento")).toBeTruthy();
    expect(getByText("Cancelar")).toBeTruthy();
  });

  it("2. Deve chamar handleUpdate ao clicar em Salvar", () => {
    const { getByTestId } = render(<EditarEventoScreen />);
    fireEvent.press(getByTestId("btn-salvar"));
    expect(mockHandleUpdate).toHaveBeenCalledTimes(1);
  });

  it("3. Deve chamar handleCancel ao clicar em Cancelar", () => {
    const { getByTestId } = render(<EditarEventoScreen />);
    fireEvent.press(getByTestId("btn-cancelar"));
    expect(mockHandleCancel).toHaveBeenCalledTimes(1);
  });
});