import { renderHook, act } from "@testing-library/react-native";
import { useFormsCadastro } from "@/libs/hooks/useFormsCadastro";
import { updateProfileType } from "@/libs/auth/updateProfileType";
import { useUser } from "@/libs/storage/UserContext";
import { Alert } from "react-native";

jest.mock("@/libs/auth/updateProfileType", () => ({
  updateProfileType: jest.fn(),
}));

jest.mock("@/libs/storage/UserContext", () => ({
  useUser: jest.fn(),
}));

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    replace: mockReplace,
    push: mockPush,
  })),
}));

jest.spyOn(Alert, "alert");

describe("useFormsCadastro", () => {
  const mockUpdateProfileType = updateProfileType as jest.Mock;
  const mockUseUser = useUser as jest.Mock;
  const mockSetUser = jest.fn();
  
  const mockUser = {
    userName: "testuser",
    token: "valid-token",
    profileType: "OLD_TYPE",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUser.mockReturnValue({ user: mockUser, setUser: mockSetUser });
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("deve redirecionar para login se usuario nao estiver autenticado", async () => {
    mockUseUser.mockReturnValue({ user: null, setUser: mockSetUser });
    const { result } = renderHook(() => useFormsCadastro());

    await act(async () => {
      await result.current.sendType("JOGADOR");
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Erro",
      "Usuário não encontrado, faça login novamente."
    );
    expect(mockReplace).toHaveBeenCalledWith("/(Auth)/login");
    expect(mockUpdateProfileType).not.toHaveBeenCalled();
  });

  it("deve tratar erro retornado pela API", async () => {
    mockUpdateProfileType.mockResolvedValue({ error: "Erro na API" });
    const { result } = renderHook(() => useFormsCadastro());

    await act(async () => {
      await result.current.sendType("JOGADOR");
    });

    expect(result.current.loading).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith("Erro ao atualizar", "Erro na API");
    expect(mockSetUser).not.toHaveBeenCalled();
  });

  it("deve tratar excecao lancada pela API", async () => {
    mockUpdateProfileType.mockRejectedValue(new Error("Erro de Rede"));
    const { result } = renderHook(() => useFormsCadastro());

    await act(async () => {
      await result.current.sendType("JOGADOR");
    });

    expect(result.current.loading).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith("Erro ao atualizar", "Erro de Rede");
  });

  it("deve atualizar perfil para JOGADOR e redirecionar para Home", async () => {
    mockUpdateProfileType.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useFormsCadastro());

    await act(async () => {
      await result.current.sendType("JOGADOR");
    });

    expect(result.current.loading).toBe(false);
    expect(mockUpdateProfileType).toHaveBeenCalledWith({
      userName: mockUser.userName,
      profileType: "JOGADOR",
      token: mockUser.token,
    });
    expect(mockSetUser).toHaveBeenCalledWith({
      ...mockUser,
      profileType: "JOGADOR",
    });
    expect(mockReplace).toHaveBeenCalledWith("/(DashBoard)/Home");
  });

  it("deve atualizar perfil para TORCEDOR e redirecionar para Home", async () => {
    mockUpdateProfileType.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useFormsCadastro());

    await act(async () => {
      await result.current.sendType("TORCEDOR");
    });

    expect(mockReplace).toHaveBeenCalledWith("/(DashBoard)/Home");
  });

  it("deve atualizar perfil para ATLETICA e redirecionar para Teams", async () => {
    mockUpdateProfileType.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useFormsCadastro());

    await act(async () => {
      await result.current.sendType("ATLETICA");
    });

    expect(mockReplace).toHaveBeenCalledWith("/(DashBoard)/Teams");
  });

  it("deve redirecionar para Home se perfil for desconhecido", async () => {
    mockUpdateProfileType.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useFormsCadastro());

    await act(async () => {
      await result.current.sendType("DESCONHECIDO");
    });

    expect(mockReplace).toHaveBeenCalledWith("/(DashBoard)/Home");
  });

  // --- CORREÇÃO NESTE TESTE ---
  it("deve redirecionar para cadastro ao chamar comebackPage", () => {
    const { result } = renderHook(() => useFormsCadastro());

    act(() => {
      result.current.comebackPage();
    });

    expect(mockPush).toHaveBeenCalledWith("/(Auth)/cadastro");
  });
});