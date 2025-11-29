import { createEvent } from "@/libs/criar/createEvento";
import { api_route } from "@/libs/auth/api";

// 1. Mock da API
jest.mock("@/libs/auth/api", () => ({
  IP: "http://fake-api.com",
  api_route: {
    post: jest.fn(),
  },
}));

const mockedPost = api_route.post as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("createEvent", () => {
  const validParams = {
    title: "Jogos Universitários",
    type: "Esportes",
    content: "Competição anual das atléticas",
    eventDate: "25/12/2025 14:30",
    eventFinishDate: "25/12/2025 18:00",
    location: "Ginásio Central",
    token: "fake-jwt-token",
  };

  // --- Teste de Sucesso ---
  it("deve formatar as datas e chamar api_route.post com URL, body e headers corretos", async () => {
    const mockResponse = {
      data: {
        id: "event-123",
        title: "Jogos Universitários",
      },
    };

    mockedPost.mockResolvedValue(mockResponse);

    const result = await createEvent(validParams);

    // Datas convertidas esperadas
    const expectedStartDate = new Date("2025-12-25T17:30:00Z").toISOString();
    const expectedFinishDate = new Date("2025-12-25T21:00:00Z").toISOString();

    expect(result).toEqual(mockResponse.data);

    expect(mockedPost).toHaveBeenCalledWith(
      "/posts",
      {
        title: validParams.title,
        type: validParams.type,
        content: validParams.content,
        eventDate: expectedStartDate,
        eventFinishDate: expectedFinishDate,
        location: validParams.location,
        group: "f9769e23-d7dc-4e61-8fb8-4b8547d16b32",
        groupId: "f9769e23-d7dc-4e61-8fb8-4b8547d16b32",
      },
      {
        headers: {
          Authorization: `Bearer ${validParams.token}`,
        },
      }
    );
  });

  // --- Teste de Erro do Servidor ---
  it("deve retornar um objeto de erro se o servidor responder com erro (ex: 400/500)", async () => {
    const errorMessage = "Data inválida para o evento";

    const mockError = {
      response: {
        data: {
          error: errorMessage,
        },
      },
    };
    mockedPost.mockRejectedValue(mockError);

    const result = await createEvent(validParams);

    expect(result).toEqual({
      error: errorMessage,
    });
  });

  it("deve retornar erro genérico se o servidor responder com erro sem mensagem específica", async () => {
    const mockError = {
      response: {
        data: {},
      },
    };
    mockedPost.mockRejectedValue(mockError);

    const result = await createEvent(validParams);

    expect(result).toEqual({
      error: "Erro ao criar evento.",
    });
  });

  // --- Teste de Erro de Rede ---
  it("deve lançar exceção se não houver resposta do servidor (erro de conexão)", async () => {
    const mockError = {
      request: {}, 
    };
    mockedPost.mockRejectedValue(mockError);

    await expect(createEvent(validParams)).rejects.toThrow(
      "Não foi possível conectar ao servidor."
    );
  });

  // --- Teste de Erro Inesperado ---
  it("deve lançar erro inesperado para falhas desconhecidas", async () => {
    const mockError = new Error("Erro bizarro do JS");
    mockedPost.mockRejectedValue(mockError);

    await expect(createEvent(validParams)).rejects.toThrow(
      "Erro inesperado ao criar [evento]."
    );
  });
});