import { renderHook, act, waitFor } from "@testing-library/react-native";

jest.mock("expo-modules-core", () => {
  const actual = jest.requireActual("expo-modules-core");
  return {
    ...actual,
    requireNativeModule: jest.fn(),
  };
});

jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'mock-push-token' })),
}));

jest.mock("expo-device", () => ({
  isDevice: true,
  osName: "iOS",
}));

jest.mock("expo-constants", () => ({
  default: {
    easConfig: { projectId: "test-project-id" },
  },
}));


import { useLoginForm } from "@/libs/hooks/useLoginForm";
import { handleLogin } from "@/libs/auth/handleLogin";
import { verifyEmail } from "@/libs/validation/userDataValidation";
import { useUser } from "@/libs/storage/UserContext";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { registerForPushNotificationsAsync } from "@/libs/notifications/registerNotifications";
import { syncPushToken } from "@/libs/notifications/syncPushToken";

jest.mock("@/libs/auth/handleLogin");
jest.mock("@/libs/validation/userDataValidation");
jest.mock("@/libs/storage/UserContext");
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@/libs/notifications/registerNotifications");
jest.mock("@/libs/notifications/syncPushToken");

describe("useLoginForm", () => {
  const mockHandleLogin = handleLogin as jest.Mock;
  const mockVerifyEmail = verifyEmail as jest.Mock;
  const mockSetUser = jest.fn();
  const mockReplace = jest.fn();
  const mockRegisterPush = registerForPushNotificationsAsync as jest.Mock;
  const mockSyncPushToken = syncPushToken as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({ setUser: mockSetUser });
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    jest.spyOn(Alert, "alert");
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  it("deve inicializar com valores padrao", () => {
    mockVerifyEmail.mockReturnValue(true); 
    const { result } = renderHook(() => useLoginForm());

    expect(result.current.formData).toEqual({ email: "", password: "" });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isButtonDisabled).toBe(true);
  });

  it("deve atualizar formData e habilitar botao quando valido", () => {
    mockVerifyEmail.mockReturnValue(false); 
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setFormData({ email: "test@email.com", password: "123" });
    });

    expect(result.current.formData.email).toBe("test@email.com");
    expect(result.current.isButtonDisabled).toBe(false);
  });

  it("deve desabilitar botao se email for invalido", () => {
    mockVerifyEmail.mockReturnValue(true);
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setFormData({ email: "invalid", password: "123" });
    });

    expect(result.current.isButtonDisabled).toBe(true);
  });

  it("deve desabilitar botao se senha estiver vazia", () => {
    mockVerifyEmail.mockReturnValue(false);
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setFormData({ email: "test@email.com", password: "" });
    });

    expect(result.current.isButtonDisabled).toBe(true);
  });

  it("deve realizar login com sucesso, registrar push token e navegar para JOGADOR", async () => {
    mockVerifyEmail.mockReturnValue(false);
    const mockUser = { id: "1", name: "User", userName: "user", email: "u@u.com", profileType: "JOGADOR" };
    const mockResponse = { token: "token123", user: mockUser };
    
    mockHandleLogin.mockResolvedValue(mockResponse);
    mockRegisterPush.mockResolvedValue("push-token-123");

    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setFormData({ email: "valid@email.com", password: "123" });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.isLoading).toBe(false);
    
    expect(mockSetUser).toHaveBeenCalledWith({ ...mockUser, token: "token123" });
    
    expect(mockSyncPushToken).toHaveBeenCalledWith("push-token-123", "token123");
    expect(mockReplace).toHaveBeenCalledWith("/(DashBoard)/(tabs)/Partidas");
  });

  it("deve continuar login mesmo se registrar notificacoes falhar", async () => {
    mockVerifyEmail.mockReturnValue(false);
    mockHandleLogin.mockResolvedValue({ token: "t", user: { profileType: "TORCEDOR" } });
    mockRegisterPush.mockRejectedValue(new Error("Push error"));

    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setFormData({ email: "valid@email.com", password: "123" });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockSyncPushToken).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/(DashBoard)/(tabs)/Home");
  });

  it("deve navegar para formsCadastro se profileType for null", async () => {
    mockVerifyEmail.mockReturnValue(false);
    mockHandleLogin.mockResolvedValue({ token: "t", user: { profileType: null } });
    mockRegisterPush.mockResolvedValue(null);

    const { result } = renderHook(() => useLoginForm());
    act(() => result.current.setFormData({ email: "v", password: "p" }));
    await act(async () => result.current.handleSubmit());

    expect(mockReplace).toHaveBeenCalledWith("/formsCadastro");
  });

  it("deve navegar para formsCadastro se profileType for undefined", async () => {
    mockVerifyEmail.mockReturnValue(false);
    mockHandleLogin.mockResolvedValue({ token: "t", user: { profileType: undefined } });

    const { result } = renderHook(() => useLoginForm());
    act(() => result.current.setFormData({ email: "v", password: "p" }));
    await act(async () => result.current.handleSubmit());

    expect(mockReplace).toHaveBeenCalledWith("/formsCadastro");
  });

  it("deve navegar para Teams se profileType for ATLETICA", async () => {
    mockVerifyEmail.mockReturnValue(false);
    mockHandleLogin.mockResolvedValue({ token: "t", user: { profileType: "ATLETICA" } });

    const { result } = renderHook(() => useLoginForm());
    act(() => result.current.setFormData({ email: "v", password: "p" }));
    await act(async () => result.current.handleSubmit());

    expect(mockReplace).toHaveBeenCalledWith("/(DashBoard)/(tabs)/Teams");
  });

  it("deve navegar para Home se profileType for desconhecido (default)", async () => {
    mockVerifyEmail.mockReturnValue(false);
    mockHandleLogin.mockResolvedValue({ token: "t", user: { profileType: "UNKNOWN" } });

    const { result } = renderHook(() => useLoginForm());
    act(() => result.current.setFormData({ email: "v", password: "p" }));
    await act(async () => result.current.handleSubmit());

    expect(mockReplace).toHaveBeenCalledWith("/(DashBoard)/(tabs)/Home");
  });

  it("deve tratar erro quando a resposta do servidor for invalida", async () => {
    mockVerifyEmail.mockReturnValue(false);
    mockHandleLogin.mockResolvedValue(null); 

    const { result } = renderHook(() => useLoginForm());
    act(() => result.current.setFormData({ email: "v", password: "p" }));
    await act(async () => result.current.handleSubmit());

    expect(result.current.error).toBe("Resposta inválida do servidor / Token não encontrado / Erro ao efetuar login");
    expect(Alert.alert).toHaveBeenCalledWith("Erro de conexão", expect.stringContaining("Resposta inválida"));
  });

  it("deve tratar erro lancado pela api de login", async () => {
    mockVerifyEmail.mockReturnValue(false);
    mockHandleLogin.mockRejectedValue(new Error("Senha incorreta"));

    const { result } = renderHook(() => useLoginForm());
    act(() => result.current.setFormData({ email: "v", password: "p" }));
    await act(async () => result.current.handleSubmit());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("Senha incorreta");
    expect(Alert.alert).toHaveBeenCalledWith("Erro de conexão", "Senha incorreta");
  });

  it("deve definir erro desconhecido se o erro nao tiver message", async () => {
    mockVerifyEmail.mockReturnValue(false);
    mockHandleLogin.mockRejectedValue({}); 

    const { result } = renderHook(() => useLoginForm());
    act(() => result.current.setFormData({ email: "v", password: "p" }));
    await act(async () => result.current.handleSubmit());

    expect(result.current.error).toBe("Erro desconhecido ao tentar login.");
  });

  it("nao deve chamar syncPushToken se token nao for retornado", async () => {
    mockVerifyEmail.mockReturnValue(false);
    mockHandleLogin.mockResolvedValue({ token: "t", user: { profileType: "JOGADOR" } });
    mockRegisterPush.mockResolvedValue(null);

    const { result } = renderHook(() => useLoginForm());
    act(() => result.current.setFormData({ email: "v", password: "p" }));
    await act(async () => result.current.handleSubmit());

    expect(mockSyncPushToken).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalled();
  });
});