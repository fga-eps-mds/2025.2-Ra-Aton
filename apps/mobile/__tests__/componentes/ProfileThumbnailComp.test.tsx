import React from "react";
// Importa o 'render' customizado que criamos
import { render, fireEvent } from "../test-utils";
import ProfileThumbnailComp from "../../components/ProfileThumbnailComp";

describe("Componente: ProfileThumbnailComp", () => {
  it("1. Deve renderizar a imagem padrão (fallback)", () => {
    // Usamos 'getByTestId' (presumindo que o <Image> tenha testID="profile-image")
    // Vamos adicionar um testID ao componente para facilitar
    const { getByTestId } = render(
      <ProfileThumbnailComp testID="profile-thumbnail" />,
    );

    // No seu ProfileThumbnailComp.tsx, adicione o testID ao TouchableOpacity:
    // <TouchableOpacity testID={testID || 'profile-thumbnail'} ... >

    expect(getByTestId("profile-thumbnail")).toBeTruthy();
  });

  it("2. Deve chamar onPress ao ser clicado", () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <ProfileThumbnailComp testID="profile-thumbnail" onPress={mockOnPress} />,
    );

    fireEvent.press(getByTestId("profile-thumbnail"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
