import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import EditarPostScreen from "@/app/(DashBoard)/(tabs)/(edit)/editarPost";

// --- MOCKS ---

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

jest.mock("@/components/PostFormComponent", () => ({
  PostFormComponent: () => {
    const { View, Text } = require("react-native");
    return (
      <View>
        <Text>Formulário de Post Mockado</Text>
      </View>
    );
  }
}));

jest.mock("@/components/PrimaryButton", () => ({
  __esModule: true,
  default: ({ onPress, children, disabled }: any) => {
    const { TouchableOpacity, Text } = require("react-native");
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} testID="btn-salvar-post">
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
      <TouchableOpacity onPress={onPress} testID="btn-cancelar-post">
        <Text>{children}</Text>
      </TouchableOpacity>
    );
  }
}));

// Mock Lógica
const mockHandleUpdatePost = jest.fn();
const mockHandleCancelPost = jest.fn();

jest.mock("@/libs/hooks/libs/EditHooks/useEditarPostLogic", () => ({
  useEditarPostLogic: () => ({
    formsData: { titulo: "Post Teste" },
    setFormData: jest.fn(),
    formError: "",
    loading: false,
    isDisabled: false,
    handleUpdate: mockHandleUpdatePost,
    handleCancel: mockHandleCancelPost
  })
}));

describe("Tela: EditarPostScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("1. Deve renderizar os elementos principais da tela", () => {
    const { getByText } = render(<EditarPostScreen />);

    expect(getByText("Editar Post")).toBeTruthy();
    expect(getByText("Formulário de Post Mockado")).toBeTruthy();
    expect(getByText("Salvar Alterações")).toBeTruthy();
    expect(getByText("Cancelar")).toBeTruthy();
  });

  it("2. Deve chamar handleUpdate ao clicar em Salvar", () => {
    const { getByTestId } = render(<EditarPostScreen />);
    fireEvent.press(getByTestId("btn-salvar-post"));
    expect(mockHandleUpdatePost).toHaveBeenCalledTimes(1);
  });

  it("3. Deve chamar handleCancel ao clicar em Cancelar", () => {
    const { getByTestId } = render(<EditarPostScreen />);
    fireEvent.press(getByTestId("btn-cancelar-post"));
    expect(mockHandleCancelPost).toHaveBeenCalledTimes(1);
  });
});