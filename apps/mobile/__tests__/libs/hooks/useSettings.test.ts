jest.mock("react-native", () => ({
  Alert: { alert: jest.fn() },
  Platform: {
    OS: "ios",
    select: (obj: any) => obj.ios, 
  },
  NativeModules: {
    SettingsManager: {
      getConstants: () => ({ AppleLocale: "en_US" }),
    },
  },
}));

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));


jest.mock("@/libs/storage/UserContext");
jest.mock("@/libs/auth/api", () => ({ api_route: { patch: jest.fn() } }));
jest.mock("@/libs/Avaliacoes/sendRatting", () => ({ sendRatting: jest.fn() }));

import { renderHook, act } from "@testing-library/react-native";
import { useSettings } from "@/libs/hooks/useSettings";
import { useUser } from "@/libs/storage/UserContext";
import { api_route } from "@/libs/auth/api";
import { sendRatting } from "@/libs/Avaliacoes/sendRatting";
import { Alert } from "react-native";


describe("useSettings hook", () => {
  const mockUser = {
    userName: "johndoe",
    token: "abc",
    notificationsAllowed: true,
  };

  beforeEach(() => {
    (useUser as jest.Mock).mockReturnValue({
      user: mockUser,
      setUser: jest.fn(),
      logout: jest.fn(),
      confirmDelete: jest.fn(),
    });
    jest.clearAllMocks();
  });

  it("deve inicializar com valores do usuário", () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.isEnabled).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.selectedTab).toBe("perfil");
    expect(result.current.rating).toBe(0);
    expect(result.current.message).toBe("");
  });

  it("deve alternar notificações com sucesso", async () => {
    const setUserMock = jest.fn();
    (useUser as jest.Mock).mockReturnValue({
      user: mockUser,
      setUser: setUserMock,
      logout: jest.fn(),
      confirmDelete: jest.fn(),
    });

    (api_route.patch as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await result.current.toggleSwitch();
    });

    expect(result.current.isEnabled).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(api_route.patch).toHaveBeenCalledWith(`/users/${mockUser.userName}`, {
      notificationsAllowed: false,
    });
    expect(setUserMock).toHaveBeenCalledWith({ ...mockUser, notificationsAllowed: false });
  });

  it("deve reverter valor e alertar em caso de erro", async () => {
    (api_route.patch as jest.Mock).mockRejectedValue(new Error("Erro de rede"));

    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await result.current.toggleSwitch();
    });

    expect(result.current.isEnabled).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith("Erro", "Não foi possível atualizar sua preferência.");
  });

  it("deve enviar feedback corretamente", () => {
    const { result } = renderHook(() => useSettings());

    act(() => result.current.setRating(5));
    act(() => result.current.setmessage("Ótimo app!"));
    act(() => result.current.enviarAvaliacao());


    expect(sendRatting).toHaveBeenCalledWith({
      rating: 5,
      message: "Ótimo app!",
      token: mockUser.token,
    });
  });

  it("deve permitir trocar a aba selecionada", () => {
    const { result } = renderHook(() => useSettings());

    act(() => result.current.setSelectedTab("feedback"));

    expect(result.current.selectedTab).toBe("feedback");
  });

  it("deve atualizar isEnabled quando o usuário mudar", () => {
    const { result, rerender } = renderHook(() => useSettings());

    expect(result.current.isEnabled).toBe(true);

    const newUser = { ...mockUser, notificationsAllowed: false };
    (useUser as jest.Mock).mockReturnValue({
      user: newUser,
      setUser: jest.fn(),
      logout: jest.fn(),
      confirmDelete: jest.fn(),
    });

    rerender({});

    expect(result.current.isEnabled).toBe(false);
  });
});
