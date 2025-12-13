import { handleReport } from "@/libs/auth/handleReport";
import { api_route } from "@/libs/auth/api";

// 1. Mockamos o módulo da API
jest.mock("@/libs/auth/api", () => ({
  api_route: {
    post: jest.fn(),
  },
}));

const mockedApiPost = api_route.post as jest.Mock;

describe("handleReport", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Silencia o console.log para não poluir a saída dos testes
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const params = {
    postId: "post-123",
    reason: "Motivo do reporte",
    reporterId: "user-abc",
  };

  // --- SUCESSO ---
  it("deve chamar a API corretamente e retornar os dados", async () => {
    const mockResponse = {
      data: {
        id: "report-123",
        postId: params.postId,
        reporterId: params.reporterId,
        reason: params.reason,
        createdAt: "2023-01-01",
      },
    };
    mockedApiPost.mockResolvedValue(mockResponse);

    const result = await handleReport(params);

    expect(mockedApiPost).toHaveBeenCalledWith(
      `/posts/${params.postId}/report`,
      {
        type: "post",
        reporterId: params.reporterId,
        reason: params.reason,
      }
    );
    expect(result).toEqual(mockResponse.data);
  });

  // --- ERROS DE REDE ---
  it("deve lançar erro genérico se não houver resposta do servidor (Erro de Rede)", async () => {
    const networkError = new Error("Network Error");
    // Sem propriedade 'response'
    mockedApiPost.mockRejectedValue(networkError);

    await expect(handleReport(params)).rejects.toThrow(
      "Não foi possível conectar ao servidor"
    );
  });

  // --- TRATAMENTO COMPLEXO DE ERRO (BRANCHES) ---

  // Caso 1: response.data é um Objeto com 'message'
  it("deve tratar erro quando response.data é um objeto com message", async () => {
    const errorMessage = "Post não encontrado";
    const mockError = {
      response: {
        data: { message: errorMessage },
      },
    };
    mockedApiPost.mockRejectedValue(mockError);

    await expect(handleReport(params)).rejects.toThrow(errorMessage);
  });

  // Caso 1b: response.data é um Objeto com 'error' (branch: data?.message || data?.error)
  it("deve tratar erro quando response.data é um objeto com error", async () => {
    const errorMessage = "Erro de validação";
    const mockError = {
      response: {
        data: { error: errorMessage },
      },
    };
    mockedApiPost.mockRejectedValue(mockError);

    await expect(handleReport(params)).rejects.toThrow(errorMessage);
  });

  // Caso 1c: response.data é um Objeto vazio ou sem mensagem (fallback)
  it("deve usar mensagem de fallback se o objeto de erro for vazio", async () => {
    const mockError = {
      response: {
        data: {}, // Objeto vazio
      },
    };
    mockedApiPost.mockRejectedValue(mockError);

    await expect(handleReport(params)).rejects.toThrow("Erro ao reportar o post");
  });

  // Caso 2: response.data é uma String JSON Válida
  it("deve fazer parse se response.data for uma string JSON válida", async () => {
    const jsonError = JSON.stringify({ message: "Erro JSON Parseado" });
    const mockError = {
      response: {
        data: jsonError, // String que parece JSON
      },
    };
    mockedApiPost.mockRejectedValue(mockError);

    await expect(handleReport(params)).rejects.toThrow("Erro JSON Parseado");
  });

  // Caso 3: response.data é uma String Simples (Parse Falha)
  it("deve tratar response.data como mensagem se for string não-JSON (Parse Falha)", async () => {
    const simpleStringError = "Internal Server Error Text";
    const mockError = {
      response: {
        data: simpleStringError, // String normal, JSON.parse vai falhar
      },
    };
    mockedApiPost.mockRejectedValue(mockError);

    // O código original captura o erro do JSON.parse e define data = { message: type_message }
    await expect(handleReport(params)).rejects.toThrow(simpleStringError);
  });
});