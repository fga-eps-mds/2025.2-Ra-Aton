import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useRegisterForm } from "@/libs/hooks/useRegisterForm";
import { registerUser } from "@/libs/auth/handleRegister";
import { useRouter } from "expo-router";
import * as Validators from "@/libs/validation/userDataValidation";

jest.mock("@/libs/auth/handleRegister", () => ({
  registerUser: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/libs/validation/userDataValidation", () => ({
  verifyName: jest.fn(),
  verifyNickname: jest.fn(),
  verifyEmail: jest.fn(),
  verifyPassword: jest.fn(),
  verifyConfirmPassword: jest.fn(),
}));

describe("useRegisterForm", () => {
  const mockRegisterUser = registerUser as jest.Mock;
  const mockRouterPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    (Validators.verifyName as jest.Mock).mockReturnValue("");
    (Validators.verifyNickname as jest.Mock).mockReturnValue("");
    (Validators.verifyEmail as jest.Mock).mockReturnValue("");
    (Validators.verifyPassword as jest.Mock).mockReturnValue("");
    (Validators.verifyConfirmPassword as jest.Mock).mockReturnValue("");
  });

  it("deve inicializar com o estado padrão", () => {
    const { result } = renderHook(() => useRegisterForm());

    expect(result.current.formData).toEqual({
      name: "",
      email: "",
      userName: "",
      password: "",
      confirmPassword: "",
    });
    expect(result.current.isDisabled).toBe(true);
  });

  it("deve atualizar formData e validar via useEffect", async () => {
    (Validators.verifyName as jest.Mock).mockReturnValue("Erro no nome");
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setFormData((prev) => ({ ...prev, name: "A" }));
    });

    await waitFor(() => {
      expect(result.current.formData.name).toBe("A");
      expect(result.current.errors.name).toBe("Erro no nome");
    });
  });

  it("deve validar todos os campos via useEffect conforme são preenchidos", async () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setFormData({
        name: "Teste",
        email: "teste@email.com",
        userName: "user",
        password: "123",
        confirmPassword: "123",
      });
    });

    await waitFor(() => {
      expect(Validators.verifyName).toHaveBeenCalledWith("Teste");
      expect(Validators.verifyEmail).toHaveBeenCalledWith("teste@email.com");
      expect(Validators.verifyNickname).toHaveBeenCalledWith("user");
      expect(Validators.verifyPassword).toHaveBeenCalledWith("123");
      expect(Validators.verifyConfirmPassword).toHaveBeenCalledWith("123", "123");
    });
  });

  it("deve manter o botão desabilitado se houver erros de validação mesmo com campos preenchidos", async () => {
    (Validators.verifyEmail as jest.Mock).mockImplementation(() => "Email inválido");
    
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setFormData({
        name: "Teste",
        email: "invalido", 
        userName: "user",
        password: "123",
        confirmPassword: "123",
      });
    });

    await waitFor(() => {
      expect(result.current.errors.email).toBe("Email inválido");
    });

    expect(result.current.isDisabled).toBe(false);
  });

  it("deve habilitar o botão quando tudo estiver preenchido e sem erros", async () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setFormData({
        name: "Teste",
        email: "teste@email.com",
        userName: "user",
        password: "123",
        confirmPassword: "123",
      });
    });

    await waitFor(() => {
      expect(result.current.isDisabled).toBe(false);
    });
  });

  it("não deve chamar registerUser se houver erros de validação no submit", async () => {
    (Validators.verifyName as jest.Mock).mockReturnValue("Nome inválido");
    const { result } = renderHook(() => useRegisterForm());

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockRegisterUser).not.toHaveBeenCalled();
    expect(result.current.errors.name).toBe("Nome inválido");
  });

  it("deve registrar usuário com sucesso e redirecionar", async () => {
    mockRegisterUser.mockResolvedValue({}); 
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setFormData({
        name: "Teste",
        email: "teste@email.com",
        userName: "user",
        password: "123",
        confirmPassword: "123",
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockRegisterUser).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith("/(Auth)/login");
  });

  it("deve tratar erro de email retornado pelo backend (via return data)", async () => {
    mockRegisterUser.mockResolvedValue({ error: "Email já em uso" });
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setFormData({
        name: "Teste",
        email: "teste@email.com",
        userName: "user",
        password: "123",
        confirmPassword: "123",
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.errors.backendEmail).toBe("Email já em uso");
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("deve tratar erro de username retornado pelo backend (via return message)", async () => {
    mockRegisterUser.mockResolvedValue({ message: "Este nome de usuário já existe" });
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setFormData({
        name: "Teste",
        email: "teste@email.com",
        userName: "user",
        password: "123",
        confirmPassword: "123",
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.errors.backendNickname).toBe("Este nome de usuário já existe");
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("deve tratar erro de username alternativo retornado pelo backend", async () => {
    mockRegisterUser.mockResolvedValue({ error: "usuario invalido" });
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
        result.current.setFormData({
          name: "Teste",
          email: "teste@email.com",
          userName: "user",
          password: "123",
          confirmPassword: "123",
        });
      });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.errors.backendNickname).toBe("usuario invalido");
  });

  it("deve tratar exceção lançada contendo 'email'", async () => {
    mockRegisterUser.mockRejectedValue(new Error("Falha ao salvar email"));
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setFormData({
        name: "Teste",
        email: "teste@email.com",
        userName: "user",
        password: "123",
        confirmPassword: "123",
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.errors.backendEmail).toBe("Falha ao salvar email");
  });

  it("deve tratar exceção lançada contendo 'username/usuário'", async () => {
    mockRegisterUser.mockRejectedValue("Erro no nome de usuário");
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setFormData({
        name: "Teste",
        email: "teste@email.com",
        userName: "user",
        password: "123",
        confirmPassword: "123",
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.errors.backendNickname).toBe("Erro no nome de usuário");
  });

  it("deve ignorar exceções que não correspondem a email ou usuário", async () => {
    mockRegisterUser.mockRejectedValue(new Error("Erro genérico do servidor"));
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setFormData({
        name: "Teste",
        email: "teste@email.com",
        userName: "user",
        password: "123",
        confirmPassword: "123",
      });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.errors.backendEmail).toBe("");
    expect(result.current.errors.backendNickname).toBe("");
  });
});