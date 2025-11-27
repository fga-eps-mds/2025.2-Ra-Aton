import { createPost } from "@/libs/criar/createPost";
import { api_route } from "@/libs/auth/api";

// 1. Mockamos o módulo local
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

describe("createPost", () => {
  const validParams = {
    title: "Novo Post",
    type: "Aviso",
    content: "Este é o conteúdo do post",
    token: "fake-jwt-token",
  };

  // --- Teste de Sucesso ---
  it("deve chamar a API com URL, body e headers corretos e retornar os dados", async () => {
    const mockResponse = {
      data: {
        id: "post-123",
        title: "Novo Post",
      },
    };

    mockedPost.mockResolvedValue(mockResponse);

    const result = await createPost(validParams);

    expect(mockedPost).toHaveBeenCalledWith(
      "/posts", 
      {
        title: validParams.title,
        type: validParams.type,
        content: validParams.content,
        group: "f9769e23-d7dc-4e61-8fb8-4b8547d16b32",
        groupId: "f9769e23-d7dc-4e61-8fb8-4b8547d16b32",
      },
      {
        headers: {
          Authorization: `Bearer ${validParams.token}`,
        },
      }
    );

    expect(result).toEqual(mockResponse.data);
  });

  // --- Teste de Erro do Servidor (Status != 2xx) ---
  it("deve retornar um objeto { error } se o servidor responder com erro", async () => {
    const serverErrorMessage = "Título muito curto.";

    const mockError = {
      response: {
        data: {
          error: serverErrorMessage,
        },
      },
    };
    mockedPost.mockRejectedValue(mockError);

    const result = await createPost(validParams);

    expect(result).toEqual({
      error: serverErrorMessage,
    });
  });

  it("deve retornar erro padrão se o servidor não enviar mensagem específica", async () => {
    const mockError = {
      response: {
        data: {}, 
      },
    };
    mockedPost.mockRejectedValue(mockError);

    const result = await createPost(validParams);

    expect(result).toEqual({
      error: "Erro ao criar evento.",
    });
  });

  // --- Teste de Erro de Rede (Sem resposta) ---
  it("deve lançar exceção se não houver resposta do servidor (erro de conexão)", async () => {
    const mockError = {
      request: {}, 
    };
    mockedPost.mockRejectedValue(mockError);

    await expect(createPost(validParams)).rejects.toThrow(
      "Não foi possível conectar ao servidor."
    );
  });

  // --- Teste de Erro Inesperado ---
  it("deve lançar exceção para erros inesperados/genéricos", async () => {
    const mockError = new Error("Falha interna");
    mockedPost.mockRejectedValue(mockError);

    await expect(createPost(validParams)).rejects.toThrow(
      "Erro inesperado ao criar [post]."
    );
  });
});