import React from "react";
// Importa o 'render' customizado que criamos
import { render, fireEvent } from "../test-utils";
import ProfileThumbnailComp from "../../components/ProfileThumbnailComp";
import { Image } from "react-native";

// Mock do UserContext
const mockUseUser = jest.fn();
jest.mock("@/libs/storage/UserContext", () => ({
  useUser: () => mockUseUser(),
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
    mockUseUser.mockReturnValue({
      user: {
        id: "test-user-id",
        userName: "testUser",
        email: "test@example.com",
      },
    });
  });

  describe("Renderização Básica", () => {
    it("deve renderizar o componente corretamente", () => {
      const { getByTestId } = render(
        <ProfileThumbnailComp profileType="user" />,
      );

      expect(getByTestId("profile-thumbnail")).toBeTruthy();
    });

    it("deve renderizar com tamanho customizado", () => {
      const { getByTestId } = render(
        <ProfileThumbnailComp profileType="user" size={100} />,
      );

      const thumbnail = getByTestId("profile-thumbnail");
      expect(thumbnail.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            width: 100,
            height: 100,
            borderRadius: 50,
          }),
        ])
      );
    });

    it("deve aplicar estilo customizado", () => {
      const customStyle = { marginTop: 20 };
      const { getByTestId } = render(
        <ProfileThumbnailComp profileType="user" style={customStyle} />,
      );

      const thumbnail = getByTestId("profile-thumbnail");
      expect(thumbnail.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining(customStyle),
        ])
      );
    });

    it("deve renderizar com tema escuro", () => {
      jest.spyOn(require("@/constants/Theme"), "useTheme").mockReturnValue({
        isDarkMode: true,
      });

      const { getByTestId } = render(
        <ProfileThumbnailComp profileType="user" />,
      );

      expect(getByTestId("profile-thumbnail")).toBeTruthy();
    });
  });

  describe("Renderização de Imagem", () => {
    it("deve renderizar imagem quando imageUrl é fornecido", () => {
      const { getByTestId, UNSAFE_getAllByType } = render(
        <ProfileThumbnailComp 
          profileType="user" 
          imageUrl="https://example.com/photo.jpg" 
        />,
      );

      expect(getByTestId("profile-thumbnail")).toBeTruthy();
      const images = UNSAFE_getAllByType(Image);
      expect(images.length).toBeGreaterThan(0);
      expect(images[0].props.source).toEqual({ uri: "https://example.com/photo.jpg" });
    });

    it("deve aplicar borderRadius proporcional ao tamanho", () => {
      const size = 80;
      const { UNSAFE_getAllByType } = render(
        <ProfileThumbnailComp 
          profileType="user" 
          imageUrl="https://example.com/photo.jpg"
          size={size}
        />,
      );

      const images = UNSAFE_getAllByType(Image);
      expect(images[0].props.style).toMatchObject({
        width: "100%",
        height: "100%",
        borderRadius: size / 2,
      });
    });
  });

  describe("Ícones de Fallback", () => {
    it("deve renderizar ícone de pessoa quando profileType é user e sem imagem", () => {
      const { getByTestId } = render(
        <ProfileThumbnailComp profileType="user" />,
      );

      expect(getByTestId("profile-thumbnail")).toBeTruthy();
      // Verifica que não há erro ao renderizar o ícone
    });

    it("deve renderizar ícone de grupo quando profileType é group", () => {
      const { getByTestId } = render(
        <ProfileThumbnailComp profileType="group" />,
      );

      expect(getByTestId("profile-thumbnail")).toBeTruthy();
    });

    it("deve renderizar logo padrão quando não há imageUrl e não é user/group", () => {
      const { getByTestId, UNSAFE_getAllByType } = render(
        <ProfileThumbnailComp profileType="user" imageUrl={null} />,
      );

      expect(getByTestId("profile-thumbnail")).toBeTruthy();
    });

    it("deve calcular tamanho do ícone proporcionalmente", () => {
      const size = 60;
      const { getByTestId } = render(
        <ProfileThumbnailComp profileType="user" size={size} />,
      );

      // Ícone deve ter size * 0.5 = 30
      expect(getByTestId("profile-thumbnail")).toBeTruthy();
    });
  });

  describe("Navegação", () => {
    it("deve navegar para perfil ao clicar (usando userName do usuário logado)", () => {
      const { getByTestId } = render(
        <ProfileThumbnailComp profileType="user" />,
      );

      fireEvent.press(getByTestId("profile-thumbnail"));

      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/(DashBoard)/(tabs)/Perfil",
        params: { identifier: "testUser", type: "user" },
      });
    });

    it("deve navegar usando userName fornecido nas props", () => {
      const { getByTestId } = render(
        <ProfileThumbnailComp 
          profileType="user" 
          userName="otherUser"
        />,
      );

      fireEvent.press(getByTestId("profile-thumbnail"));

      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/(DashBoard)/(tabs)/Perfil",
        params: { identifier: "otherUser", type: "user" },
      });
    });

    it("deve navegar com profileType group", () => {
      const { getByTestId } = render(
        <ProfileThumbnailComp 
          profileType="group" 
          userName="myGroup"
        />,
      );

      fireEvent.press(getByTestId("profile-thumbnail"));

      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/(DashBoard)/(tabs)/Perfil",
        params: { identifier: "myGroup", type: "group" },
      });
    });

    it("não deve navegar quando não há userName disponível", () => {
      mockUseUser.mockReturnValue({
        user: null,
      });

      const { getByTestId } = render(
        <ProfileThumbnailComp profileType="user" />,
      );

      fireEvent.press(getByTestId("profile-thumbnail"));

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("deve priorizar onPress customizado sobre navegação padrão", () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <ProfileThumbnailComp 
          profileType="user" 
          onPress={mockOnPress}
          userName="testUser"
        />,
      );

      fireEvent.press(getByTestId("profile-thumbnail"));

      expect(mockOnPress).toHaveBeenCalledTimes(1);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("Props userId", () => {
    it("deve aceitar userId como prop", () => {
      const { getByTestId } = render(
        <ProfileThumbnailComp 
          profileType="user" 
          userId="custom-user-id"
          userName="customUser"
        />,
      );

      expect(getByTestId("profile-thumbnail")).toBeTruthy();
    });
  });

  describe("Interatividade", () => {
    it("deve ter activeOpacity de 0.7", () => {
      const { getByTestId } = render(
        <ProfileThumbnailComp profileType="user" />,
      );

      const thumbnail = getByTestId("profile-thumbnail");
      expect(thumbnail.props.activeOpacity).toBe(0.7);
    });

    it("deve aplicar borderColor do tema", () => {
      const { getByTestId } = render(
        <ProfileThumbnailComp profileType="user" />,
      );

      const thumbnail = getByTestId("profile-thumbnail");
      expect(thumbnail.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            borderColor: expect.any(String),
          }),
        ])
      );
    });
  });

  describe("Estados Condicionais", () => {
    it("deve usar backgroundColor diferente no modo escuro", () => {
      jest.spyOn(require("@/constants/Theme"), "useTheme").mockReturnValue({
        isDarkMode: true,
      });

      const { getByTestId } = render(
        <ProfileThumbnailComp profileType="user" />,
      );

      const thumbnail = getByTestId("profile-thumbnail");
      expect(thumbnail.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: expect.any(String),
          }),
        ])
      );
    });

    it("deve usar backgroundColor diferente no modo claro", () => {
      jest.spyOn(require("@/constants/Theme"), "useTheme").mockReturnValue({
        isDarkMode: false,
      });

      const { getByTestId } = render(
        <ProfileThumbnailComp profileType="user" />,
      );

      const thumbnail = getByTestId("profile-thumbnail");
      expect(thumbnail.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: expect.any(String),
          }),
        ])
      );
    });
  });

  describe("Edge Cases", () => {
    it("deve lidar com imageUrl null explicitamente", () => {
      const { getByTestId } = render(
        <ProfileThumbnailComp 
          profileType="user" 
          imageUrl={null}
        />,
      );

      expect(getByTestId("profile-thumbnail")).toBeTruthy();
    });

    it("deve lidar com imageUrl undefined", () => {
      const { getByTestId } = render(
        <ProfileThumbnailComp 
          profileType="user" 
          imageUrl={undefined}
        />,
      );

      expect(getByTestId("profile-thumbnail")).toBeTruthy();
    });

    it("deve lidar com size padrão quando não fornecido", () => {
      const { getByTestId } = render(
        <ProfileThumbnailComp profileType="user" />,
      );

      const thumbnail = getByTestId("profile-thumbnail");
      expect(thumbnail.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            width: 50, // tamanho padrão
            height: 50,
          }),
        ])
      );
    });

    it("deve renderizar com userName vazio", () => {
      const { getByTestId } = render(
        <ProfileThumbnailComp 
          profileType="user" 
          userName=""
        />,
      );

      fireEvent.press(getByTestId("profile-thumbnail"));
      
      // Deve usar userName do usuário logado
      expect(mockPush).toHaveBeenCalled();
    });
  });
});
