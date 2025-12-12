import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SettingsScreen from "@/app/(DashBoard)/(tabs)/Settings";


jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), prefetch: jest.fn() },
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));

jest.mock("@/libs/hooks/useSettings", () => {
  const mockSetMessage = jest.fn();
  const mockEnviarAvaliacao = jest.fn();
  const mockToggleSwitch = jest.fn();
  const mockLogout = jest.fn();
  const mockConfirmDelete = jest.fn();
  const mockSetRating = jest.fn();

 
  let state = {
    selectedTab: "feedback",
    isLoading: false,
    isEnabled: true,
    rating: 0,
    message: "",
  };

  return {
    useSettings: () => ({
      ...state,
      setSelectedTab: (tab: string) => { state.selectedTab = tab; },
      toggleSwitch: mockToggleSwitch,
      logout: mockLogout,
      confirmDelete: mockConfirmDelete,
      setRating: mockSetRating,
      setmessage: mockSetMessage,
      enviarAvaliacao: mockEnviarAvaliacao,
    }),
    __setState: (newState: Partial<typeof state>) => { state = { ...state, ...newState }; },
    __getMocks: () => ({
      mockSetMessage,
      mockEnviarAvaliacao,
      mockToggleSwitch,
      mockLogout,
      mockConfirmDelete,
      mockSetRating,
    }),
  };
});

describe("SettingsScreen - Feedback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { __setState } = require("@/libs/hooks/useSettings");
    __setState({ selectedTab: "feedback", isLoading: false, message: "", rating: 0 });
  });

  it("updates feedback text when typing", () => {
    const { __getMocks } = require("@/libs/hooks/useSettings");
    const { mockSetMessage } = __getMocks();
    const { getByPlaceholderText } = render(<SettingsScreen />);
    const input = getByPlaceholderText("Digite sua avaliação");
    fireEvent.changeText(input, "Ótimo");
    expect(mockSetMessage).toHaveBeenCalledWith("Ótimo");
  });

  it("calls enviarAvaliacao when Enviar button is pressed", () => {
    const { __getMocks } = require("@/libs/hooks/useSettings");
    const { mockEnviarAvaliacao } = __getMocks();
    const { getByText } = render(<SettingsScreen />);
    fireEvent.press(getByText("Enviar"));
    expect(mockEnviarAvaliacao).toHaveBeenCalled();
  });
});
