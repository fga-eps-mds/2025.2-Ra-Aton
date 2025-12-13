import React from "react";
// Importa o 'render' customizado que criamos
import { render, fireEvent } from "../test-utils";
import ProfileThumbnailComp from "../../components/ProfileThumbnailComp";

// Mock do UserContext
jest.mock("@/libs/storage/UserContext", () => ({
  useUser: () => ({
    user: {
      id: "test-user-id",
      userName: "testUser",
      email: "test@example.com",
    },
  }),
}));

// Mock do expo-router
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("Componente: ProfileThumbnailComp", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("1. Deve renderizar a imagem padrão (fallback)", () => {
    const { getByTestId } = render(
      <ProfileThumbnailComp testID="profile-thumbnail" profileType="user" />,
    );

    expect(getByTestId("profile-thumbnail")).toBeTruthy();
  });

  it("2. Deve chamar onPress ao ser clicado", () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <ProfileThumbnailComp testID="profile-thumbnail" onPress={mockOnPress} profileType="user" />,
    );

    fireEvent.press(getByTestId("profile-thumbnail"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
