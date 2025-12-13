import { renderHook, act } from "@testing-library/react-native";
import { useEditarPostLogic } from "@/libs/hooks/libs/EditHooks/useEditarPostLogic";
import { api_route } from "@/libs/auth/api";
import { useRouter, useLocalSearchParams } from "expo-router";

// --- MOCKS ---
jest.mock("@/libs/auth/api", () => ({
  api_route: {
    patch: jest.fn(),
  },
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

describe("useEditarPostLogic", () => {
  const mockRouterBack = jest.fn();
  const mockApiPatch = api_route.patch as jest.Mock;

  // Dados mockados para simular o post recebido via params
  const mockPostData = {
    id: "post-123",
    title: "Post Original",
    content: "Conteúdo original do post",
    type: "GENERAL",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      back: mockRouterBack,
    });

    (useLocalSearchParams as jest.Mock).mockReturnValue({
      postData: JSON.stringify(mockPostData),
    });

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("deve inicializar o formulário com os dados do post recebido", () => {
    const { result } = renderHook(() => useEditarPostLogic());

    expect(result.current.formsData.titulo).toBe(mockPostData.title);
    expect(result.current.formsData.descricao).toBe(mockPostData.content);
    expect(result.current.isDisabled).toBe(false);
  });

  it("deve lidar com JSON inválido nos parametros", () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      postData: "invalid-json-string",
    });

    const { result } = renderHook(() => useEditarPostLogic());

    expect(result.current.alertConfig.visible).toBe(true);
    expect(result.current.alertConfig.title).toBe("Erro");
    expect(result.current.alertConfig.message).toBe("Dados do post inválidos.");

    // Simula confirmação do alerta para voltar
    act(() => {
      if (result.current.alertConfig.onConfirm) {
        result.current.alertConfig.onConfirm();
      }
    });

    expect(mockRouterBack).toHaveBeenCalled();
  });

  it("deve atualizar o estado do formulário", () => {
    const { result } = renderHook(() => useEditarPostLogic());

    act(() => {
      result.current.setFormData((prev) => ({
        ...prev,
        titulo: "Título Editado",
        descricao: "Descrição Editada",
      }));
    });

    expect(result.current.formsData.titulo).toBe("Título Editado");
    expect(result.current.formsData.descricao).toBe("Descrição Editada");
  });

  it("deve validar campos obrigatórios antes de atualizar", async () => {
    const { result } = renderHook(() => useEditarPostLogic());

    // Limpa o título
    act(() => {
      result.current.setFormData((prev) => ({ ...prev, titulo: "" }));
    });

    // O botão deve estar desabilitado visualmente
    expect(result.current.isDisabled).toBe(true);

    // Tenta forçar o update
    await act(async () => {
      await result.current.handleUpdate();
    });

    expect(result.current.alertConfig.visible).toBe(true);
    expect(result.current.alertConfig.message).toBe("O título é obrigatório.");
    expect(mockApiPatch).not.toHaveBeenCalled();
  });

  it("deve enviar a atualização com sucesso", async () => {
    const { result } = renderHook(() => useEditarPostLogic());

    // Atualiza dados
    act(() => {
      result.current.setFormData({
        titulo: "Novo Título",
        descricao: "Nova Descrição",
      });
    });

    mockApiPatch.mockResolvedValue({ data: { success: true } });

    await act(async () => {
      await result.current.handleUpdate();
    });

    // Verifica chamada da API
    expect(mockApiPatch).toHaveBeenCalledWith(`/posts/${mockPostData.id}`, {
      title: "Novo Título",
      content: "Nova Descrição",
    });

    // Verifica alerta de sucesso
    expect(result.current.alertConfig.visible).toBe(true);
    expect(result.current.alertConfig.title).toBe("Sucesso");

    // Confirma alerta para navegar de volta
    act(() => {
      if (result.current.alertConfig.onConfirm) {
        result.current.alertConfig.onConfirm();
      }
    });

    expect(mockRouterBack).toHaveBeenCalled();
  });

  it("deve lidar com erro da API sem message específica", async () => {
    const { result } = renderHook(() => useEditarPostLogic());

    mockApiPatch.mockRejectedValue({
      response: { data: {} }, // Sem message
    });

    await act(async () => {
      await result.current.handleUpdate();
    });

    expect(result.current.formError).toBe("Não foi possível atualizar o post.");
    expect(result.current.alertConfig.visible).toBe(true);
    expect(result.current.alertConfig.message).toBe(
      "Não foi possível atualizar o post.",
    );
  });

  it("deve lidar com erro da API sem response", async () => {
    const { result } = renderHook(() => useEditarPostLogic());

    mockApiPatch.mockRejectedValue(new Error("Network error"));

    await act(async () => {
      await result.current.handleUpdate();
    });

    expect(result.current.formError).toBe("Não foi possível atualizar o post.");
    expect(result.current.alertConfig.visible).toBe(true);
  });

  it("não deve fazer nada se postId for null", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      postData: undefined, // Sem dados
    });

    const { result } = renderHook(() => useEditarPostLogic());

    expect(result.current.formsData.titulo).toBe("");
    expect(result.current.formsData.descricao).toBe("");

    await act(async () => {
      await result.current.handleUpdate();
    });

    expect(mockApiPatch).not.toHaveBeenCalled();
  });

  it("deve navegar para trás ao cancelar", () => {
    const { result } = renderHook(() => useEditarPostLogic());

    act(() => {
      result.current.handleCancel();
    });

    expect(mockRouterBack).toHaveBeenCalled();
  });

  it("deve fechar o alerta manualmente", () => {
    const { result } = renderHook(() => useEditarPostLogic());

    // Força um alerta (ex: erro de validação)
    act(() => {
      result.current.setFormData((prev) => ({ ...prev, titulo: "" }));
    });

    act(() => {
      result.current.handleUpdate();
    });

    expect(result.current.alertConfig.visible).toBe(true);

    act(() => {
      result.current.closeAlert();
    });

    expect(result.current.alertConfig.visible).toBe(false);
  });
});
