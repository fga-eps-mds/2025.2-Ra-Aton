import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useEditarEventoLogic } from "@/libs/hooks/libs/EditHooks/useEditarEventLogic";
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

describe("useEditarEventoLogic", () => {
  const mockRouterBack = jest.fn();
  const mockApiPatch = api_route.patch as jest.Mock;

  // Dados de exemplo para popular o formulário
  const mockPostData = {
    id: "123",
    title: "Evento Teste",
    content: "Descrição do evento",
    eventDate: "2025-12-25T14:00:00.000Z",
    eventFinishDate: "2025-12-25T18:00:00.000Z",
    location: "Ginásio Central",
    type: "EVENT",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ back: mockRouterBack });
    // Mock padrão retornando dados válidos
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      postData: JSON.stringify(mockPostData),
    });
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  it("deve inicializar e popular o formulário com os dados do post", () => {
    const { result } = renderHook(() => useEditarEventoLogic());

    expect(result.current.formsData.titulo).toBe(mockPostData.title);
    expect(result.current.formsData.descricao).toBe(mockPostData.content);
    expect(result.current.formsData.dataInicio).toBe(mockPostData.eventDate);
    expect(result.current.formsData.local).toBe(mockPostData.location);
    expect(result.current.isDisabled).toBe(false);
  });

  it("deve lidar com erro ao fazer parse de dados inválidos na inicialização", () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      postData: "invalid-json",
    });

    const { result } = renderHook(() => useEditarEventoLogic());

    expect(result.current.alertConfig.visible).toBe(true);
    expect(result.current.alertConfig.title).toBe("Erro");
    expect(result.current.alertConfig.message).toBe("Dados inválidos.");

    // Simula clique no botão do alerta para voltar
    act(() => {
      if (result.current.alertConfig.onConfirm) {
        result.current.alertConfig.onConfirm();
      }
    });
    expect(mockRouterBack).toHaveBeenCalled();
  });

  it("deve atualizar o estado do formulário corretamente", () => {
    const { result } = renderHook(() => useEditarEventoLogic());

    act(() => {
      result.current.setFormData((prev) => ({
        ...prev,
        titulo: "Novo Título",
      }));
    });

    expect(result.current.formsData.titulo).toBe("Novo Título");
  });

  it("deve bloquear envio se campos obrigatórios estiverem vazios", async () => {
    const { result } = renderHook(() => useEditarEventoLogic());

    // Limpa um campo obrigatório
    act(() => {
      result.current.setFormData((prev) => ({ ...prev, titulo: "" }));
    });

    expect(result.current.isDisabled).toBe(true); // Verificação do booleano derivado

    // Tenta enviar mesmo assim para testar a validação interna do handleUpdate
    await act(async () => {
      await result.current.handleUpdate();
    });

    expect(result.current.alertConfig.visible).toBe(true);
    expect(result.current.alertConfig.message).toContain("obrigatórios");
    expect(mockApiPatch).not.toHaveBeenCalled();
  });

  it("deve bloquear envio se a descrição for muito curta", async () => {
    const { result } = renderHook(() => useEditarEventoLogic());

    act(() => {
      result.current.setFormData((prev) => ({ ...prev, descricao: "a" }));
    });

    await act(async () => {
      await result.current.handleUpdate();
    });

    expect(result.current.alertConfig.visible).toBe(true);
    expect(result.current.alertConfig.message).toContain(
      "pelo menos 2 caracteres",
    );
    expect(mockApiPatch).not.toHaveBeenCalled();
  });

  it("deve converter data formato Mobile (DD/MM/YYYY HH:mm) e enviar atualização com sucesso", async () => {
    const { result } = renderHook(() => useEditarEventoLogic());

    // Configura dados válidos com formato brasileiro/mobile
    act(() => {
      result.current.setFormData({
        titulo: "Jogo Final",
        descricao: "Grande final",
        local: "Arena",
        dataInicio: "25/12/2025 15:30", // Formato Mobile
        dataFim: "25/12/2025 17:30", // Formato Mobile
      });
    });

    mockApiPatch.mockResolvedValue({ data: {} });

    await act(async () => {
      await result.current.handleUpdate();
    });

    // Verifica se a API foi chamada
    expect(mockApiPatch).toHaveBeenCalledTimes(1);

    // Verifica se a conversão de data ocorreu no payload
    const payloadEnviado = mockApiPatch.mock.calls[0][1];

    // 25/12/2025 15:30 -> ISO String deve conter 2025-12-25T15:30:00 (ajustado ao timezone ou UTC)
    // Verificamos apenas se converteu para o formato ISO esperado (contém T, hífens e dois pontos)
    expect(payloadEnviado.eventDate).toMatch(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    );
    expect(payloadEnviado.eventFinishDate).toMatch(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    );

    // Verifica alerta de sucesso
    expect(result.current.alertConfig.visible).toBe(true);
    expect(result.current.alertConfig.title).toBe("Sucesso");

    // Confirma e verifica navegação
    act(() => {
      if (result.current.alertConfig.onConfirm) {
        result.current.alertConfig.onConfirm();
      }
    });
    expect(mockRouterBack).toHaveBeenCalled();
  });

  it("deve aceitar data já em formato ISO (Web)", async () => {
    const { result } = renderHook(() => useEditarEventoLogic());
    const isoDate = "2025-12-25T14:00:00.000Z";

    act(() => {
      result.current.setFormData((prev) => ({
        ...prev,
        dataInicio: isoDate, // Já ISO
      }));
    });

    mockApiPatch.mockResolvedValue({});

    await act(async () => {
      await result.current.handleUpdate();
    });

    expect(mockApiPatch).toHaveBeenCalled();
    const payload = mockApiPatch.mock.calls[0][1];
    expect(payload.eventDate).toBe(isoDate); // Deve manter inalterado se já for ISO válido
  });

  it("deve lidar com erro na conversão de data", async () => {
    const { result } = renderHook(() => useEditarEventoLogic());

    act(() => {
      result.current.setFormData((prev) => ({
        ...prev,
        dataInicio: "Data Invalida", // Formato desconhecido
      }));
    });

    await act(async () => {
      await result.current.handleUpdate();
    });

    // Deve cair no catch do handleUpdate
    expect(mockApiPatch).not.toHaveBeenCalled();
    expect(result.current.alertConfig.visible).toBe(true);
    expect(result.current.alertConfig.title).toBe("Erro");
    
    // CORREÇÃO: O hook original ignora o message do erro local e usa o fallback
    expect(result.current.alertConfig.message).toBe("Erro ao atualizar evento.");
  });

  it("deve tratar erro da API ao atualizar", async () => {
    const { result } = renderHook(() => useEditarEventoLogic());

    // Dados válidos para passar da validação inicial
    act(() => {
      result.current.setFormData({
        titulo: "Teste",
        descricao: "Desc",
        local: "Local",
        dataInicio: "2025-01-01T12:00:00.000Z",
        dataFim: "",
      });
    });

    const errorMsg = "Erro interno do servidor";
    mockApiPatch.mockRejectedValue({
      response: { data: { error: errorMsg } },
    });

    await act(async () => {
      await result.current.handleUpdate();
    });

    expect(result.current.formError).toBe(errorMsg);
    expect(result.current.alertConfig.visible).toBe(true);
    expect(result.current.alertConfig.message).toBe(errorMsg);
  });

  it("deve navegar para trás ao cancelar", () => {
    const { result } = renderHook(() => useEditarEventoLogic());

    act(() => {
      result.current.handleCancel();
    });

    expect(mockRouterBack).toHaveBeenCalled();
  });

  it("deve fechar o alerta manualmente", () => {
    const { result } = renderHook(() => useEditarEventoLogic());

    // Forçando um erro de validação para abrir alerta
    act(() => {
      result.current.setFormData((prev) => ({ ...prev, titulo: "" }));
    });

    // Dispara validação
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