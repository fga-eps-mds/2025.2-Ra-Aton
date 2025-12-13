import EditarUsuarioScreen from "@/app/(DashBoard)/(tabs)/(edit)/editarUsuario";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import * as ExpoRouter from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { updateUserImages } from "@/libs/user/handleUserProfile";
import { useUser } from "@/libs/storage/UserContext";
import { useTheme } from "@/constants/Theme";

jest.mock("@/libs/user/handleUserProfile");
jest.mock("@/libs/storage/UserContext");
jest.mock("@/constants/Theme");
jest.mock("@/components/BackGroundComp", () => {
  const { View } = require("react-native");
  return ({ children }: any) => <View testID="background-comp">{children}</View>;
});

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};

const mockUser = {
  id: "user-123",
  userName: "testuser",
  token: "test-token",
};

describe("EditarUsuarioScreen", () => {
  let useRouterSpy: jest.SpyInstance;
  let useLocalSearchParamsSpy: jest.SpyInstance;
  let useUserSpy: jest.SpyInstance;
  let useThemeSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(Alert, "alert").mockImplementation(() => {});

    useRouterSpy = jest.spyOn(ExpoRouter, "useRouter");
    useRouterSpy.mockReturnValue(mockRouter as any);

    useLocalSearchParamsSpy = jest.spyOn(ExpoRouter, "useLocalSearchParams");
    useLocalSearchParamsSpy.mockReturnValue({
      userId: "user-123",
      userName: "testuser",
      profilePicture: "https://example.com/profile.jpg",
      bannerImage: "https://example.com/banner.jpg",
      bio: "Minha bio de teste",
    });

    useUserSpy = jest.spyOn(require("@/libs/storage/UserContext"), "useUser");
    useUserSpy.mockReturnValue({ user: mockUser });

    useThemeSpy = jest.spyOn(require("@/constants/Theme"), "useTheme");
    useThemeSpy.mockReturnValue({ isDarkMode: false });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Renderização", () => {
    it("deve renderizar a tela corretamente", () => {
      render(<EditarUsuarioScreen />);

      expect(screen.getByText("Editar Perfil")).toBeTruthy();
      expect(screen.getByText("Biografia")).toBeTruthy();
      expect(screen.getByText("Banner do Perfil")).toBeTruthy();
      expect(screen.getByText("Foto de Perfil")).toBeTruthy();
      expect(screen.getByText("Salvar Alterações")).toBeTruthy();
    });

    it("deve exibir input de bio", () => {
      render(<EditarUsuarioScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para seu perfil...");
      expect(bioInput).toBeTruthy();
    });

    it("deve exibir contador de caracteres inicial", () => {
      render(<EditarUsuarioScreen />);

      expect(screen.getByText(/\/200/)).toBeTruthy();
    });

    it("deve renderizar com bio vazia quando não fornecida", () => {
      useLocalSearchParamsSpy.mockReturnValue({
        userId: "user-123",
        userName: "testuser",
      });

      render(<EditarUsuarioScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para seu perfil...");
      expect(bioInput.props.value).toBe("");
    });

    it("deve renderizar com tema escuro", () => {
      useThemeSpy.mockReturnValue({ isDarkMode: true });

      render(<EditarUsuarioScreen />);

      expect(screen.getByText("Editar Perfil")).toBeTruthy();
    });
  });

  describe("Edição de Bio", () => {
    it("deve atualizar o texto da bio", () => {
      render(<EditarUsuarioScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para seu perfil...");
      fireEvent.changeText(bioInput, "Nova bio do usuário");

      expect(bioInput.props.value).toBe("Nova bio do usuário");
    });

    it("deve atualizar contador de caracteres ao digitar", () => {
      render(<EditarUsuarioScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para seu perfil...");
      fireEvent.changeText(bioInput, "Nova bio");

      expect(screen.getByText("8/200")).toBeTruthy();
    });

    it("deve respeitar limite de 200 caracteres", () => {
      render(<EditarUsuarioScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para seu perfil...");
      expect(bioInput.props.maxLength).toBe(200);
    });
  });

  describe("Seleção de Imagens", () => {
    it("deve solicitar permissões ao selecionar foto de perfil", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      render(<EditarUsuarioScreen />);

      const profileContainer = screen.getByText("Foto de Perfil").parent?.parent;
      const profileButton = profileContainer?.findByType("TouchableOpacity" as any);
      
      if (profileButton) {
        fireEvent.press(profileButton);
      }

      await waitFor(() => {
        expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
      });
    });

    it("deve exibir alerta quando permissão for negada", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "denied",
      });

      render(<EditarUsuarioScreen />);

      const profileContainer = screen.getByText("Foto de Perfil").parent?.parent;
      const profileButton = profileContainer?.findByType("TouchableOpacity" as any);
      
      if (profileButton) {
        fireEvent.press(profileButton);
      }

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Permissão negada",
          "Precisamos de permissão para acessar suas fotos"
        );
      });
    });

    it("deve selecionar foto de perfil com sucesso", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:///new-profile.jpg" }],
      });

      render(<EditarUsuarioScreen />);

      const profileContainer = screen.getByText("Foto de Perfil").parent?.parent;
      const profileButton = profileContainer?.findByType("TouchableOpacity" as any);
      
      if (profileButton) {
        fireEvent.press(profileButton);
      }

      await waitFor(() => {
        expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      });
    });

    it("deve selecionar banner com sucesso", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:///new-banner.jpg" }],
      });

      render(<EditarUsuarioScreen />);

      const bannerContainer = screen.getByText("Banner do Perfil").parent?.parent;
      const bannerButton = bannerContainer?.findByType("TouchableOpacity" as any);
      
      if (bannerButton) {
        fireEvent.press(bannerButton);
      }

      await waitFor(() => {
        expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [16, 9],
          quality: 0.8,
        });
      });
    });

    it("não deve fazer nada quando usuário cancelar seleção de imagem", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      render(<EditarUsuarioScreen />);

      const profileContainer = screen.getByText("Foto de Perfil").parent?.parent;
      const profileButton = profileContainer?.findByType("TouchableOpacity" as any);
      
      if (profileButton) {
        fireEvent.press(profileButton);
      }

      await waitFor(() => {
        expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      });

      expect(updateUserImages).not.toHaveBeenCalled();
    });
  });

  describe("Salvamento", () => {
    it("deve exibir alerta quando tentar salvar sem alterações", async () => {
      render(<EditarUsuarioScreen />);

      const saveButton = screen.getByText("Salvar Alterações");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Atenção",
          "Faça alguma alteração antes de salvar"
        );
      });

      expect(updateUserImages).not.toHaveBeenCalled();
    });

    it("deve chamar updateUserImages quando bio é alterada", async () => {
      (updateUserImages as jest.Mock).mockResolvedValue(undefined);

      render(<EditarUsuarioScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para seu perfil...");
      fireEvent.changeText(bioInput, "Nova bio atualizada");

      const saveButton = screen.getByText("Salvar Alterações");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(updateUserImages).toHaveBeenCalled();
      });
    });

    it("deve exibir loading durante salvamento", async () => {
      (updateUserImages as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<EditarUsuarioScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para seu perfil...");
      fireEvent.changeText(bioInput, "Nova bio");

      const saveButton = screen.getByText("Salvar Alterações");
      fireEvent.press(saveButton);

      await waitFor(() => {
        const activityIndicator = screen.UNSAFE_queryAllByType("ActivityIndicator" as any);
        expect(activityIndicator.length).toBeGreaterThan(0);
      });
    });

    it("deve tratar erro ao salvar alterações", async () => {
      (updateUserImages as jest.Mock).mockRejectedValue(
        new Error("Erro ao atualizar perfil do usuário")
      );

      render(<EditarUsuarioScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para seu perfil...");
      fireEvent.changeText(bioInput, "Nova bio");

      const saveButton = screen.getByText("Salvar Alterações");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Erro",
          "Erro ao atualizar perfil do usuário"
        );
      });

      expect(console.error).toHaveBeenCalled();
    });

    it("deve tratar erro sem mensagem ao salvar", async () => {
      (updateUserImages as jest.Mock).mockRejectedValue({});

      render(<EditarUsuarioScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para seu perfil...");
      fireEvent.changeText(bioInput, "Nova bio");

      const saveButton = screen.getByText("Salvar Alterações");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Erro",
          "Erro ao atualizar perfil do usuário"
        );
      });
    });

    it("deve exibir alerta de sucesso após salvar", async () => {
      (updateUserImages as jest.Mock).mockResolvedValue(undefined);

      render(<EditarUsuarioScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para seu perfil...");
      fireEvent.changeText(bioInput, "Nova bio");

      const saveButton = screen.getByText("Salvar Alterações");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Sucesso",
          "Perfil atualizado com sucesso!",
          expect.any(Array)
        );
      });
    });

    it("deve chamar updateUserImages quando apenas bio muda", async () => {
      (updateUserImages as jest.Mock).mockResolvedValue(undefined);

      render(<EditarUsuarioScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para seu perfil...");
      fireEvent.changeText(bioInput, "Biografia completamente nova");

      const saveButton = screen.getByText("Salvar Alterações");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(updateUserImages).toHaveBeenCalled();
        const call = (updateUserImages as jest.Mock).mock.calls[0];
        expect(call[1]).toBe(null); // profilePictureUri
        expect(call[2]).toBe(null); // bannerImageUri
        expect(call[3]).toBe("Biografia completamente nova"); // bio
        expect(call[4]).toBe("test-token"); // token
      });
    });

    it("deve enviar bio como null quando bio não mudou", async () => {
      (updateUserImages as jest.Mock).mockResolvedValue(undefined);
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:///new-profile.jpg" }],
      });

      render(<EditarUsuarioScreen />);

      // Selecionar foto de perfil
      const profileContainer = screen.getByText("Foto de Perfil").parent?.parent;
      const profileButton = profileContainer?.findByType("TouchableOpacity" as any);
      if (profileButton) {
        fireEvent.press(profileButton);
      }

      await waitFor(() => {
        expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      });

      const saveButton = screen.getByText("Salvar Alterações");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(updateUserImages).toHaveBeenCalled();
        const call = (updateUserImages as jest.Mock).mock.calls[0];
        expect(call[1]).toBe("file:///new-profile.jpg"); // profilePictureUri
        expect(call[2]).toBe(null); // bannerImageUri
        expect(call[3]).toBe(null); // bio não mudou, deve ser null
        expect(call[4]).toBe("test-token"); // token
      });
    });
  });

  describe("Placeholder de Imagens", () => {
    it("deve exibir placeholder quando foto de perfil não está definida", () => {
      useLocalSearchParamsSpy.mockReturnValue({
        userId: "user-123",
        userName: "testuser",
      });

      render(<EditarUsuarioScreen />);

      expect(screen.getByText("Foto de Perfil")).toBeTruthy();
    });

    it("deve exibir placeholder de banner quando não está definido", () => {
      useLocalSearchParamsSpy.mockReturnValue({
        userId: "user-123",
        userName: "testuser",
      });

      render(<EditarUsuarioScreen />);

      expect(screen.getByText("Toque para adicionar banner")).toBeTruthy();
    });
  });

  describe("Estados de UI", () => {
    it("deve desabilitar botão durante salvamento", async () => {
      (updateUserImages as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<EditarUsuarioScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para seu perfil...");
      fireEvent.changeText(bioInput, "Nova bio");

      const saveButton = screen.getByText("Salvar Alterações").parent;
      fireEvent.press(saveButton);

      await waitFor(() => {
        const buttons = screen.UNSAFE_queryAllByType("TouchableOpacity" as any);
        const saveBtn = buttons.find(btn => btn.props.disabled === true);
        expect(saveBtn).toBeTruthy();
      });
    });

    it("deve aplicar estilo de botão desabilitado durante loading", async () => {
      (updateUserImages as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<EditarUsuarioScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para seu perfil...");
      fireEvent.changeText(bioInput, "Nova bio");

      const saveButton = screen.getByText("Salvar Alterações");
      fireEvent.press(saveButton);

      await waitFor(() => {
        const activityIndicator = screen.UNSAFE_queryAllByType("ActivityIndicator" as any);
        expect(activityIndicator.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Integração com Seleção de Múltiplas Imagens", () => {
    it("deve permitir selecionar profile e banner separadamente", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock)
        .mockResolvedValueOnce({
          canceled: false,
          assets: [{ uri: "file:///new-profile.jpg" }],
        })
        .mockResolvedValueOnce({
          canceled: false,
          assets: [{ uri: "file:///new-banner.jpg" }],
        });
      (updateUserImages as jest.Mock).mockResolvedValue(undefined);

      render(<EditarUsuarioScreen />);

      // Selecionar profile
      const profileContainer = screen.getByText("Foto de Perfil").parent?.parent;
      const profileButton = profileContainer?.findByType("TouchableOpacity" as any);
      if (profileButton) {
        fireEvent.press(profileButton);
      }

      await waitFor(() => {
        expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledTimes(1);
      });

      // Selecionar banner
      const bannerContainer = screen.getByText("Banner do Perfil").parent?.parent;
      const bannerButton = bannerContainer?.findByType("TouchableOpacity" as any);
      if (bannerButton) {
        fireEvent.press(bannerButton);
      }

      await waitFor(() => {
        expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledTimes(2);
      });

      // Salvar
      const saveButton = screen.getByText("Salvar Alterações");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(updateUserImages).toHaveBeenCalled();
        const call = (updateUserImages as jest.Mock).mock.calls[0];
        expect(call[1]).toBe("file:///new-profile.jpg"); // profilePictureUri
        expect(call[2]).toBe("file:///new-banner.jpg"); // bannerImageUri
        expect(call[3]).toBe(null); // bio
        expect(call[4]).toBe("test-token"); // token
      });
    });

    it("deve permitir alterar bio e imagens juntos", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:///new-profile.jpg" }],
      });
      (updateUserImages as jest.Mock).mockResolvedValue(undefined);

      render(<EditarUsuarioScreen />);

      // Alterar bio
      const bioInput = screen.getByPlaceholderText("Escreva uma bio para seu perfil...");
      fireEvent.changeText(bioInput, "Bio e imagem novos");

      // Selecionar profile
      const profileContainer = screen.getByText("Foto de Perfil").parent?.parent;
      const profileButton = profileContainer?.findByType("TouchableOpacity" as any);
      if (profileButton) {
        fireEvent.press(profileButton);
      }

      await waitFor(() => {
        expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      });

      // Salvar
      const saveButton = screen.getByText("Salvar Alterações");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(updateUserImages).toHaveBeenCalled();
        const call = (updateUserImages as jest.Mock).mock.calls[0];
        expect(call[1]).toBe("file:///new-profile.jpg"); // profilePictureUri
        expect(call[2]).toBe(null); // bannerImageUri  
        expect(call[3]).toBe("Bio e imagem novos"); // bio
        expect(call[4]).toBe("test-token"); // token
      });
    });
  });
});
