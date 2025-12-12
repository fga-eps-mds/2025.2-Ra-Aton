import { renderHook, act } from "@testing-library/react-native";
import * as ExpoRouter from "expo-router";

const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/libs/group/handleCreateGroup", () => ({
  handleCreateGroup: jest.fn(),
}));

jest.mock("@/libs/utils/alert", () => ({
  showSuccessAlert: jest.fn(),
  showErrorAlert: jest.fn(),
}));

import { useCreateGroupForm } from "@/libs/hooks/useCreateGroupForm";
const { handleCreateGroup } = require("@/libs/group/handleCreateGroup");
const { showErrorAlert } = require("@/libs/utils/alert");

describe("useCreateGroupForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (ExpoRouter.useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
      back: mockBack,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("deve inicializar com valores padrão", () => {
    const { result } = renderHook(() => useCreateGroupForm());
    expect(result.current.selectedType).toBe("ATHLETIC");
  });

  it("deve validar erros locais (ex: nome curto)", async () => {
    const { result } = renderHook(() => useCreateGroupForm());

    await act(async () => {
      await result.current.submitForm();
    });

    expect(handleCreateGroup).not.toHaveBeenCalled();
    expect(result.current.errors.name).toBeDefined();
  });


  it("deve definir erro manual no campo 'name' se a API retornar erro de conflito de nome (Linhas 83-88)", async () => {
    const errorMsg = "Este Nome já está em Uso por outro grupo";
    (handleCreateGroup as jest.Mock).mockRejectedValue(new Error(errorMsg));

    const { result } = renderHook(() => useCreateGroupForm());

    await act(async () => {
      result.current.setValue("name", "Nome Duplicado");
      result.current.setValue("type", "AMATEUR");
    });

    await act(async () => {
      await result.current.submitForm();
    });

    expect(result.current.errors.name).toBeDefined();
    expect(result.current.errors.name?.message).toBe("Este nome já está em uso.");
    expect(showErrorAlert).not.toHaveBeenCalled();
  });

  it("deve mostrar alerta genérico para outros erros da API (Linhas 89-91)", async () => {
    const errorMsg = "Erro interno do servidor 500";
    (handleCreateGroup as jest.Mock).mockRejectedValue(new Error(errorMsg));

    const { result } = renderHook(() => useCreateGroupForm());

    await act(async () => {
      result.current.setValue("name", "Nome Valido");
      result.current.setValue("type", "AMATEUR");
    });

  
    await act(async () => {
      await result.current.submitForm();
    });

    expect(showErrorAlert).toHaveBeenCalledWith("Erro", errorMsg);
    expect(result.current.errors.name).toBeUndefined();
  });

  // -----------------------------------------

  it("deve chamar API, redirecionar e mostrar alerta de sucesso (Caminho Feliz)", async () => {
    (handleCreateGroup as jest.Mock).mockResolvedValue({
      id: "grupo-123-id",
      name: "Novo Grupo",
    });

    const { result } = renderHook(() => useCreateGroupForm());

    await act(async () => {
      result.current.setValue("name", "Novo Grupo");
      result.current.setValue("description", "Teste");
      result.current.setValue("type", "AMATEUR");
      result.current.setValue("sport", "Futsal");
    });

    await act(async () => {
      await result.current.submitForm();
    });

    expect(handleCreateGroup).toHaveBeenCalled();

    act(() => {
      jest.runAllTimers();
    });

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: "/perfilGrupo",
      params: { id: "grupo-123-id" },
    });
  });
});