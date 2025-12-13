// ARQUIVO: apps/mobile/__tests__/libs/hooks/useCreateGroupForm.test.ts
import { renderHook, act } from "@testing-library/react-native";
import * as ExpoRouter from "expo-router";

// 1. MOCKS SIMPLIFICADOS

const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockPush = jest.fn();

// Mock Router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

// Mock API
jest.mock("@/libs/group/handleCreateGroup", () => ({
  handleCreateGroup: jest.fn(),
}));

// 2. MOCK DO NOSSO UTILS (A mágica acontece aqui)
// Como é um arquivo local TS, o Jest mocka sem reclamar.
jest.mock("@/libs/utils/alert", () => ({
  showSuccessAlert: jest.fn(),
  showErrorAlert: jest.fn(),
}));

// 3. Imports
import { useCreateGroupForm } from "@/libs/hooks/useCreateGroupForm";
const { handleCreateGroup } = require("@/libs/group/handleCreateGroup");
// Importamos o mock para verificar se foi chamado
const { showSuccessAlert } = require("@/libs/utils/alert");

describe("useCreateGroupForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (ExpoRouter.useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
      back: mockBack,
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("deve inicializar corretamente", () => {
    const { result } = renderHook(() => useCreateGroupForm());
    expect(result.current.selectedType).toBe("ATHLETIC");
  });

  it("deve validar erros", async () => {
    const { result } = renderHook(() => useCreateGroupForm());

    await act(async () => {
      await result.current.submitForm();
    });

    expect(handleCreateGroup).not.toHaveBeenCalled();
    expect(result.current.errors.name).toBeDefined();
  });

  it("deve chamar API, redirecionar e mostrar alerta de sucesso", async () => {
    // Mock sucesso
    handleCreateGroup.mockResolvedValue({
      id: "grupo-123-id",
      name: "Novo Grupo",
    });

    const { result } = renderHook(() => useCreateGroupForm());

    // Preenche
    await act(async () => {
      result.current.setValue("name", "Novo Grupo");
      result.current.setValue("description", "Teste");
      result.current.setValue("type", "AMATEUR");
      result.current.setValue("sport", "Futsal");
    });

    // Submete
    await act(async () => {
      await result.current.submitForm();
    });

    // Verifica API
    expect(handleCreateGroup).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Novo Grupo" }),
    );

    // Avança o tempo
    act(() => {
      jest.runAllTimers();
    });

    // Verifica Redirecionamento
    expect(mockPush).toHaveBeenCalledWith({
      pathname: `/(DashBoard)/(tabs)/Perfil`,
      params: { identifier: "Novo Grupo", type: "group" },
    });

    // Verifica se nossa função wrapper foi chamada (sem erro de undefined!)
    expect(showSuccessAlert).toHaveBeenCalledWith(
      "Sucesso",
      expect.stringContaining("criado"),
    );
  });
});
