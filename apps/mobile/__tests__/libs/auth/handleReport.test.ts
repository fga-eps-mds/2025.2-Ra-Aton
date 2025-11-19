// ARQUIVO: apps/mobile/__tests__/libs/auth/handleReport.test.ts
import { handleReport } from "@/libs/auth/handleReport";
import { api_route } from "@/libs/auth/api"; // Importamos o original para mockar

// 1. Mockamos o módulo da API
// Dizemos ao JEST: "qualquer chamada a 'api_route.post' deve ser substituída por uma função falsa"
jest.mock("@/libs/auth/api", () => ({
  api_route: {
    post: jest.fn(), // Criamos um "espião" (spy)
  },
}));

// 2. Criamos uma variável 'tipada' para o nosso mock para facilitar o uso
const mockedApiPost = api_route.post as jest.Mock;

// Limpa os mocks (histórico de chamadas) antes de cada teste
beforeEach(() => {
  mockedApiPost.mockClear();
});

describe("handleReport", () => {
  // Teste de Sucesso
  it("deve chamar a API com a URL, body e parâmetros corretos", async () => {
    // O que esperamos que a API retorne
    const mockResponse = {
      data: {
        id: "report-123",
        message: "Denúncia registrada",
      },
    };
    // Simula uma resposta de sucesso
    mockedApiPost.mockResolvedValue(mockResponse);

    const params = {
      postId: "post-123-abc",
      reason: "Isso é um teste de denúncia de 10 caracteres",
    };

    // Executa a função
    await handleReport(params);

    // Verificamos se 'api_route.post' foi chamada CORRETAMENTE
    expect(mockedApiPost).toHaveBeenCalledWith(
      `/posts/${params.postId}/report`, // A URL correta
      {
        reason: params.reason, // O Body correto
        type: "post",
      },
    );
    expect(mockedApiPost).toHaveBeenCalledTimes(1);
  });

  // Teste de Falha (ex: 404)
  it("deve lançar um erro do servidor se a api falhar", async () => {
    const errorMessage = "Post não encontrado";

    // Simula uma falha de API (como o 'catch (err: any)' no seu handleLogin)
    const mockError = {
      response: {
        data: {
          message: errorMessage,
        },
      },
    };
    mockedApiPost.mockRejectedValue(mockError);

    const params = {
      postId: "id-que-nao-existe",
      reason: "Teste de falha de 10 caracteres",
    };

    // Verificamos se a função 'handleReport' realmente lança o erro
    await expect(handleReport(params))
      .rejects // Esperamos que seja rejeitada
      .toThrow(errorMessage); // E que a mensagem de erro seja a que o servidor enviou
  });

  // Teste de Falha de Rede
  it("deve lançar um erro genérico se for um erro de rede", async () => {
    // Simula um erro onde 'err.response' não existe
    const mockError = new Error("Network Error");
    mockedApiPost.mockRejectedValue(mockError);

    const params = {
      postId: "post-123",
      reason: "Teste de falha de 10 caracteres",
    };

    await expect(handleReport(params)).rejects.toThrow(
      "Não foi possível conectar ao servidor",
    ); // A mensagem do 'catch' final
  });
});
