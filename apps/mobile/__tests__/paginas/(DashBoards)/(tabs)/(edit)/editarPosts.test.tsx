import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import EditarPostScreen from "@/app/(DashBoard)/(tabs)/(edit)/editarPost";

// --- MOCKS VISUAIS ---

jest.mock("@/components/BackGroundComp", () => {
  const { View } = require("react-native");
  return ({ children }: any) => <View>{children}</View>;
});

jest.mock("@/components/SpacerComp", () => () => null);

jest.mock("@/components/AppText", () => {
  const { Text } = require("react-native");
  return (props: any) => <Text {...props}>{props.children}</Text>;
});

jest.mock("@/components/PostFormComponent", () => ({
  PostFormComponent: () => {
    const { Text } = require("react-native");
    return <Text>Formulário de Post Mockado</Text>;
  }
}));

jest.mock("@/components/CustomAlertModalComp", () => ({
  CustomAlertModalComp: () => null
}));

jest.mock("@/components/PrimaryButton", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return ({ onPress, children }: any) => (
    <TouchableOpacity onPress={onPress} testID="btn-salvar-post"><Text>{children}</Text></TouchableOpacity>
  );
});

jest.mock("@/components/SecondaryButton", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return ({ onPress, children }: any) => (
    <TouchableOpacity onPress={onPress} testID="btn-cancelar-post"><Text>{children}</Text></TouchableOpacity>
  );
});

// Mock Lógica
const mockHandleUpdatePost = jest.fn();
const mockHandleCancelPost = jest.fn();

jest.mock("@/libs/hooks/libs/EditHooks/useEditarPostLogic", () => ({
  useEditarPostLogic: () => ({
    formsData: { titulo: "Post" },
    setFormData: jest.fn(),
    formError: "",
    loading: false,
    isDisabled: false,
    alertConfig: { visible: false },
    handleUpdate: mockHandleUpdatePost,
    handleCancel: mockHandleCancelPost
  })
}));

describe("Tela: EditarPostScreen", () => {
  it("Renderiza e interage", () => {
    const { getByText, getByTestId } = render(<EditarPostScreen />);

    expect(getByText("Editar Post")).toBeTruthy();
    
    fireEvent.press(getByTestId("btn-salvar-post"));
    expect(mockHandleUpdatePost).toHaveBeenCalled();

    fireEvent.press(getByTestId("btn-cancelar-post"));
    expect(mockHandleCancelPost).toHaveBeenCalled();
  });
});