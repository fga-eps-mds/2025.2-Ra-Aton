import EditarGrupoScreen from "@/app/(DashBoard)/(tabs)/(edit)/editarGrupo";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import * as ExpoRouter from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { updateGroupImages } from "@/libs/group/handleGroupProfile";
import { useUser } from "@/libs/storage/UserContext";
import { useTheme } from "@/constants/Theme";

// Não re-mock expo-router, use o mock global
jest.mock("@/libs/group/handleGroupProfile");
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

describe("EditarGrupoScreen", () => {
  let useRouterSpy: jest.SpyInstance;
  let useLocalSearchParamsSpy: jest.SpyInstance;
  let useUserSpy: jest.SpyInstance;
  let useThemeSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(Alert, "alert").mockImplementation(() => {});

    // Create spies that we can control
    useRouterSpy = jest.spyOn(ExpoRouter, "useRouter");
    useRouterSpy.mockReturnValue(mockRouter as any);

    useLocalSearchParamsSpy = jest.spyOn(ExpoRouter, "useLocalSearchParams");
    useLocalSearchParamsSpy.mockReturnValue({
      groupId: "group-123",
      groupName: "Grupo Teste",
      logoUrl: "https://example.com/logo.jpg",
      bannerUrl: "https://example.com/banner.jpg",
      bio: "Bio do grupo teste",
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
      render(<EditarGrupoScreen />);

      expect(screen.getByText("Editar Perfil do Grupo")).toBeTruthy();
      expect(screen.getByText("Biografia")).toBeTruthy();
      expect(screen.getByText("Banner do Grupo")).toBeTruthy();
      expect(screen.getByText("Logo do Grupo")).toBeTruthy();
      expect(screen.getByText("Salvar Alterações")).toBeTruthy();
    });

    it("deve exibir input de bio", () => {
      render(<EditarGrupoScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para o grupo...");
      expect(bioInput).toBeTruthy();
    });

    it("deve exibir contador de caracteres inicial", () => {
      render(<EditarGrupoScreen />);

      expect(screen.getByText(/\/200/)).toBeTruthy();
    });

    it("deve renderizar com bio vazia quando não fornecida", () => {
      useLocalSearchParamsSpy.mockReturnValue({
        groupId: "group-123",
        groupName: "Grupo Teste",
      });

      render(<EditarGrupoScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para o grupo...");
      expect(bioInput.props.value).toBe("");
    });

    it("deve renderizar com tema escuro", () => {
      useThemeSpy.mockReturnValue({ isDarkMode: true });

      render(<EditarGrupoScreen />);

      expect(screen.getByText("Editar Perfil do Grupo")).toBeTruthy();
    });
  });

  describe("Edição de Bio", () => {
    it("deve atualizar o texto da bio", () => {
      render(<EditarGrupoScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para o grupo...");
      fireEvent.changeText(bioInput, "Nova bio do grupo");

      expect(bioInput.props.value).toBe("Nova bio do grupo");
    });

    it("deve atualizar contador de caracteres ao digitar", () => {
      render(<EditarGrupoScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para o grupo...");
      fireEvent.changeText(bioInput, "Nova bio");

      expect(screen.getByText("8/200")).toBeTruthy();
    });

    it("deve respeitar limite de 200 caracteres", () => {
      render(<EditarGrupoScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para o grupo...");
      expect(bioInput.props.maxLength).toBe(200);
    });
  });

  describe("Seleção de Imagens", () => {
    it("deve solicitar permissões ao selecionar logo", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      render(<EditarGrupoScreen />);

      const logoContainer = screen.getByText("Logo do Grupo").parent?.parent;
      const logoButton = logoContainer?.findByType("TouchableOpacity" as any);
      
      if (logoButton) {
        fireEvent.press(logoButton);
      }

      await waitFor(() => {
        expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
      });
    });

    it("deve exibir alerta quando permissão for negada", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "denied",
      });

      render(<EditarGrupoScreen />);

      const logoContainer = screen.getByText("Logo do Grupo").parent?.parent;
      const logoButton = logoContainer?.findByType("TouchableOpacity" as any);
      
      if (logoButton) {
        fireEvent.press(logoButton);
      }

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Permissão negada",
          "Precisamos de permissão para acessar suas fotos"
        );
      });
    });

    it("deve selecionar logo com sucesso", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:///new-logo.jpg" }],
      });

      render(<EditarGrupoScreen />);

      const logoContainer = screen.getByText("Logo do Grupo").parent?.parent;
      const logoButton = logoContainer?.findByType("TouchableOpacity" as any);
      
      if (logoButton) {
        fireEvent.press(logoButton);
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

      render(<EditarGrupoScreen />);

      const bannerContainer = screen.getByText("Banner do Grupo").parent?.parent;
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

      render(<EditarGrupoScreen />);

      const logoContainer = screen.getByText("Logo do Grupo").parent?.parent;
      const logoButton = logoContainer?.findByType("TouchableOpacity" as any);
      
      if (logoButton) {
        fireEvent.press(logoButton);
      }

      await waitFor(() => {
        expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      });

      expect(updateGroupImages).not.toHaveBeenCalled();
    });
  });

  describe("Salvamento", () => {
    it("deve exibir alerta quando tentar salvar sem alterações", async () => {
      render(<EditarGrupoScreen />);

      const saveButton = screen.getByText("Salvar Alterações");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Atenção",
          "Faça alguma alteração antes de salvar"
        );
      });

      expect(updateGroupImages).not.toHaveBeenCalled();
    });

    it("deve salvar alterações de bio com sucesso", async () => {
      (updateGroupImages as jest.Mock).mockResolvedValue(undefined);

      render(<EditarGrupoScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para o grupo...");
      fireEvent.changeText(bioInput, "Nova bio atualizada");

      const saveButton = screen.getByText("Salvar Alterações");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(updateGroupImages).toHaveBeenCalled();
      });

      const call = (updateGroupImages as jest.Mock).mock.calls[0];
      expect(call[1]).toBe(null); // logo
      expect(call[2]).toBe(null); // banner
      expect(call[3]).toBe("Nova bio atualizada"); // bio
      expect(call[4]).toBe("test-token"); // authToken

      expect(Alert.alert).toHaveBeenCalledWith(
        "Sucesso",
        "Perfil atualizado com sucesso!",
        expect.any(Array)
      );
    });

    it("deve salvar alterações de logo com sucesso", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:///new-logo.jpg" }],
      });
      (updateGroupImages as jest.Mock).mockResolvedValue(undefined);

      render(<EditarGrupoScreen />);

      const logoContainer = screen.getByText("Logo do Grupo").parent?.parent;
      const logoButton = logoContainer?.findByType("TouchableOpacity" as any);
      
      if (logoButton) {
        fireEvent.press(logoButton);
      }

      await waitFor(() => {
        expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      });

      const saveButton = screen.getByText("Salvar Alterações");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(updateGroupImages).toHaveBeenCalled();
      });

      const call = (updateGroupImages as jest.Mock).mock.calls[0];
      expect(call[1]).toBe("file:///new-logo.jpg"); // logo
      expect(call[2]).toBe(null); // banner
      expect(call[3]).toBe(null); // bio
      expect(call[4]).toBe("test-token"); // authToken
    });

    it("deve salvar alterações de banner com sucesso", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:///new-banner.jpg" }],
      });
      (updateGroupImages as jest.Mock).mockResolvedValue(undefined);

      render(<EditarGrupoScreen />);

      const bannerContainer = screen.getByText("Banner do Grupo").parent?.parent;
      const bannerButton = bannerContainer?.findByType("TouchableOpacity" as any);
      
      if (bannerButton) {
        fireEvent.press(bannerButton);
      }

      await waitFor(() => {
        expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      });

      const saveButton = screen.getByText("Salvar Alterações");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(updateGroupImages).toHaveBeenCalled();
      });

      const call = (updateGroupImages as jest.Mock).mock.calls[0];
      expect(call[1]).toBe(null); // logo
      expect(call[2]).toBe("file:///new-banner.jpg"); // banner
      expect(call[3]).toBe(null); // bio
      expect(call[4]).toBe("test-token"); // authToken
    });

    it("deve salvar todas as alterações juntas", async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock)
        .mockResolvedValueOnce({
          canceled: false,
          assets: [{ uri: "file:///new-logo.jpg" }],
        })
        .mockResolvedValueOnce({
          canceled: false,
          assets: [{ uri: "file:///new-banner.jpg" }],
        });
      (updateGroupImages as jest.Mock).mockResolvedValue(undefined);

      render(<EditarGrupoScreen />);

      // Selecionar logo
      const logoContainer = screen.getByText("Logo do Grupo").parent?.parent;
      const logoButton = logoContainer?.findByType("TouchableOpacity" as any);
      if (logoButton) {
        fireEvent.press(logoButton);
      }

      await waitFor(() => {
        expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledTimes(1);
      });

      // Selecionar banner
      const bannerContainer = screen.getByText("Banner do Grupo").parent?.parent;
      const bannerButton = bannerContainer?.findByType("TouchableOpacity" as any);
      if (bannerButton) {
        fireEvent.press(bannerButton);
      }

      await waitFor(() => {
        expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledTimes(2);
      });

      // Alterar bio
      const bioInput = screen.getByPlaceholderText("Escreva uma bio para o grupo...");
      fireEvent.changeText(bioInput, "Nova bio completa");

      // Salvar
      const saveButton = screen.getByText("Salvar Alterações");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(updateGroupImages).toHaveBeenCalled();
      });

      const call = (updateGroupImages as jest.Mock).mock.calls[0];
      expect(call[1]).toBe("file:///new-logo.jpg"); // logo
      expect(call[2]).toBe("file:///new-banner.jpg"); // banner
      expect(call[3]).toBe("Nova bio completa"); // bio
      expect(call[4]).toBe("test-token"); // authToken
    });

    it("deve exibir loading durante salvamento", async () => {
      (updateGroupImages as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<EditarGrupoScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para o grupo...");
      fireEvent.changeText(bioInput, "Nova bio");

      const saveButton = screen.getByText("Salvar Alterações");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(screen.getByTestId("activity-indicator")).toBeTruthy();
      });
    });

    it("deve desabilitar botão durante salvamento", async () => {
      (updateGroupImages as jest.Mock).mockResolvedValue(undefined);

      render(<EditarGrupoScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para o grupo...");
      fireEvent.changeText(bioInput, "Nova bio");

      const saveButton = screen.getByText("Salvar Alterações");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(updateGroupImages).toHaveBeenCalled();
      });
    });

    it("deve tratar erro ao salvar alterações", async () => {
      (updateGroupImages as jest.Mock).mockRejectedValue(
        new Error("Erro ao atualizar perfil do grupo")
      );

      render(<EditarGrupoScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para o grupo...");
      fireEvent.changeText(bioInput, "Nova bio");

      const saveButton = screen.getByText("Salvar Alterações");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Erro",
          "Erro ao atualizar perfil do grupo"
        );
      });

      expect(console.error).toHaveBeenCalled();
    });

    it("deve tratar erro sem mensagem ao salvar", async () => {
      (updateGroupImages as jest.Mock).mockRejectedValue({});

      render(<EditarGrupoScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para o grupo...");
      fireEvent.changeText(bioInput, "Nova bio");

      const saveButton = screen.getByText("Salvar Alterações");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Erro",
          "Erro ao atualizar perfil do grupo"
        );
      });
    });

    it("deve voltar após salvar com sucesso", async () => {
      (updateGroupImages as jest.Mock).mockResolvedValue(undefined);

      render(<EditarGrupoScreen />);

      const bioInput = screen.getByPlaceholderText("Escreva uma bio para o grupo...");
      fireEvent.changeText(bioInput, "Nova bio");

      const saveButton = screen.getByText("Salvar Alterações");
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Sucesso",
          "Perfil atualizado com sucesso!",
          expect.arrayContaining([
            expect.objectContaining({
              text: "OK",
              onPress: expect.any(Function),
            }),
          ])
        );
      });

      // Verifica que o alerta foi chamado com callback
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      expect(alertCall[2][0].onPress).toBeDefined();
    });
  });

  describe("Placeholder de Imagens", () => {
    it("deve exibir placeholder quando logo não está definido", () => {
      useLocalSearchParamsSpy.mockReturnValue({
        groupId: "group-123",
        groupName: "Grupo Teste",
      });

      render(<EditarGrupoScreen />);

      expect(screen.getByText("Logo do Grupo")).toBeTruthy();
    });

    it("deve exibir placeholder de banner quando não está definido", () => {
      useLocalSearchParamsSpy.mockReturnValue({
        groupId: "group-123",
        groupName: "Grupo Teste",
      });

      render(<EditarGrupoScreen />);

      expect(screen.getByText("Toque para adicionar banner")).toBeTruthy();
    });
  });
});


