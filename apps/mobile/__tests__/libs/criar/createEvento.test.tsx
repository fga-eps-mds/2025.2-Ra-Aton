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

// Mock do console para evitar logs durante os testes
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  mockConsoleLog.mockRestore();
  mockConsoleError.mockRestore();
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
    groupId: "f9769e23-d7dc-4e61-8fb8-4b8547d16b32",
  };

  describe("Sucesso - Criação de Eventos", () => {
    it("deve criar evento com datas no formato MOBILE (dd/mm/yyyy HH:MM)", async () => {
      const mockResponse = {
        data: {
          id: "event-123",
          title: "Jogos Universitários",
        },
      };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await createEvent(validParams);

      expect(result).toEqual(mockResponse.data);
      expect(mockedPost).toHaveBeenCalledWith(
        "/posts",
        expect.objectContaining({
          title: validParams.title,
          type: validParams.type,
          content: validParams.content,
          location: validParams.location,
          groupId: validParams.groupId,
        }),
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${validParams.token}`,
          },
        })
      );
    });

    it("deve criar evento com datas no formato WEB (ISO com T)", async () => {
      const mockResponse = {
        data: {
          id: "event-456",
          title: "Evento Web",
        },
      };

      mockedPost.mockResolvedValue(mockResponse);

      const webParams = {
        ...validParams,
        eventDate: "2025-12-25T14:30:00",
        eventFinishDate: "2025-12-25T18:00:00",
      };

      const result = await createEvent(webParams);

      expect(result).toEqual(mockResponse.data);
      expect(mockedPost).toHaveBeenCalled();
    });

    it("deve criar evento sem eventFinishDate (opcional)", async () => {
      const mockResponse = {
        data: {
          id: "event-789",
          title: "Evento Sem Fim",
        },
      };

      mockedPost.mockResolvedValue(mockResponse);

      const paramsWithoutFinish = {
        ...validParams,
        eventFinishDate: "",
      };

      const result = await createEvent(paramsWithoutFinish);

      expect(result).toEqual(mockResponse.data);
      expect(mockedPost).toHaveBeenCalledWith(
        "/posts",
        expect.objectContaining({
          eventFinishDate: undefined,
        }),
        expect.any(Object)
      );
    });

    it("deve logar os parâmetros recebidos", async () => {
      mockedPost.mockResolvedValue({ data: { id: "123" } });

      await createEvent(validParams);

      expect(mockConsoleLog).toHaveBeenCalledWith('[createEvent] Parâmetros recebidos:');
      expect(mockConsoleLog).toHaveBeenCalledWith('  - title:', validParams.title);
      expect(mockConsoleLog).toHaveBeenCalledWith('  - groupId:', validParams.groupId);
    });

    it("deve logar o payload sendo enviado", async () => {
      mockedPost.mockResolvedValue({ data: { id: "123" } });

      await createEvent(validParams);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[createEvent] Payload sendo enviado:',
        expect.stringContaining('"title"')
      );
    });

    it("deve incluir eventFinishDate no payload quando fornecido", async () => {
      mockedPost.mockResolvedValue({ data: { id: "123" } });

      await createEvent(validParams);

      const callArgs = mockedPost.mock.calls[0];
      expect(callArgs[1]).toHaveProperty('eventFinishDate');
      expect(callArgs[1].eventFinishDate).toBeTruthy();
    });
  });

  describe("Conversão de Datas - convertToBackendDate", () => {
    it("deve converter data MOBILE corretamente", async () => {
      mockedPost.mockResolvedValue({ data: { id: "123" } });

      await createEvent({
        ...validParams,
        eventDate: "15/06/2025 10:30",
      });

      const callArgs = mockedPost.mock.calls[0];
      const sentDate = callArgs[1].eventDate;
      
      expect(sentDate).toContain('2025');
      expect(sentDate).toContain('T');
    });

    it("deve converter data WEB corretamente", async () => {
      mockedPost.mockResolvedValue({ data: { id: "123" } });

      await createEvent({
        ...validParams,
        eventDate: "2025-06-15T10:30:00",
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Data convertida (WEB):',
        expect.any(String)
      );
    });

    it("deve converter eventFinishDate quando fornecido", async () => {
      mockedPost.mockResolvedValue({ data: { id: "123" } });

      await createEvent(validParams);

      const callArgs = mockedPost.mock.calls[0];
      expect(callArgs[1].eventFinishDate).toBeTruthy();
    });

    it("deve retornar erro quando eventDate não é fornecida", async () => {
      const result = await createEvent({
        ...validParams,
        eventDate: "",
      });

      expect(result).toEqual({
        error: "Data não fornecida.",
      });
      expect(mockedPost).not.toHaveBeenCalled();
    });

    it("deve retornar erro quando data WEB é inválida", async () => {
      const result = await createEvent({
        ...validParams,
        eventDate: "2025-13-45T99:99:99", // Mês e dia inválidos
      });

      expect(result).toEqual({
        error: "Data inválida.",
      });
      expect(mockedPost).not.toHaveBeenCalled();
    });

    it("deve retornar erro quando data MOBILE é inválida", async () => {
      const result = await createEvent({
        ...validParams,
        eventDate: "99/99/2025 25:99", // Data impossível
      });

      expect(result).toEqual({
        error: "Data fornecida é inválida.",
      });
      expect(mockedPost).not.toHaveBeenCalled();
    });

    it("deve retornar erro para formato de data desconhecido", async () => {
      const result = await createEvent({
        ...validParams,
        eventDate: "25-12-2025", // Formato não suportado
      });

      expect(result).toEqual({
        error: "Formato de data inválido.",
      });
      expect(mockedPost).not.toHaveBeenCalled();
    });

    it("deve logar data convertida para formato WEB", async () => {
      mockedPost.mockResolvedValue({ data: { id: "123" } });

      await createEvent({
        ...validParams,
        eventDate: "2025-12-25T14:30:00",
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Data convertida (WEB):',
        expect.stringContaining('2025')
      );
    });

    it("deve logar data convertida para formato MOBILE", async () => {
      mockedPost.mockResolvedValue({ data: { id: "123" } });

      await createEvent({
        ...validParams,
        eventDate: "25/12/2025 14:30",
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Data convertida (MOBILE):',
        expect.stringContaining('2025')
      );
    });
  });

  describe("Erros do Servidor (Response)", () => {
    it("deve retornar erro quando servidor responde com error", async () => {
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

    it("deve retornar erro de issues[0].message quando disponível", async () => {
      const mockError = {
        response: {
          data: {
            issues: [
              { message: "Título muito curto" },
            ],
          },
        },
      };
      mockedPost.mockRejectedValue(mockError);

      const result = await createEvent(validParams);

      expect(result).toEqual({
        error: "Título muito curto",
      });
    });

    it("deve priorizar issues[0].message sobre error", async () => {
      const mockError = {
        response: {
          data: {
            issues: [
              { message: "Erro de validação" },
            ],
            error: "Erro genérico",
          },
        },
      };
      mockedPost.mockRejectedValue(mockError);

      const result = await createEvent(validParams);

      expect(result).toEqual({
        error: "Erro de validação",
      });
    });

    it("deve retornar erro genérico quando data está vazio", async () => {
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

    it("deve retornar erro genérico quando data é null", async () => {
      const mockError = {
        response: {
          data: null,
        },
      };
      mockedPost.mockRejectedValue(mockError);

      const result = await createEvent(validParams);

      expect(result).toEqual({
        error: "Erro ao criar evento.",
      });
    });

    it("deve lidar com múltiplos issues pegando apenas o primeiro", async () => {
      const mockError = {
        response: {
          data: {
            issues: [
              { message: "Primeiro erro" },
              { message: "Segundo erro" },
            ],
          },
        },
      };
      mockedPost.mockRejectedValue(mockError);

      const result = await createEvent(validParams);

      expect(result).toEqual({
        error: "Primeiro erro",
      });
    });
  });

  describe("Erros de Rede (Request)", () => {
    it("deve lançar erro quando não há resposta do servidor", async () => {
      const mockError = {
        request: {},
      };
      mockedPost.mockRejectedValue(mockError);

      await expect(createEvent(validParams)).rejects.toThrow(
        "Não foi possível conectar ao servidor."
      );
    });

    it("deve logar erro no console quando há request sem response", async () => {
      const mockRequest = { url: "/posts", timeout: 5000 };
      const mockError = {
        request: mockRequest,
      };
      mockedPost.mockRejectedValue(mockError);

      await expect(createEvent(validParams)).rejects.toThrow();

      expect(mockConsoleError).toHaveBeenCalledWith(
        "Sem resposta do servidor:",
        mockRequest
      );
    });
  });

  describe("Erros Inesperados", () => {
    it("deve lançar erro inesperado para falhas desconhecidas", async () => {
      const mockError = new Error("Erro bizarro do JS");
      mockedPost.mockRejectedValue(mockError);

      await expect(createEvent(validParams)).rejects.toThrow(
        "Erro inesperado ao criar [evento]."
      );
    });

    it("deve logar erro no console para falhas inesperadas", async () => {
      const mockError = new Error("Network error");
      mockedPost.mockRejectedValue(mockError);

      await expect(createEvent(validParams)).rejects.toThrow();

      expect(mockConsoleError).toHaveBeenCalledWith(
        "Erro ao criar evento:",
        "Network error"
      );
    });

    it("deve lidar com erro sem message", async () => {
      const mockError = {};
      mockedPost.mockRejectedValue(mockError);

      await expect(createEvent(validParams)).rejects.toThrow(
        "Erro inesperado ao criar [evento]."
      );
    });
  });

  describe("Validação de Parâmetros", () => {
    it("deve aceitar todos os parâmetros obrigatórios", async () => {
      mockedPost.mockResolvedValue({ data: { id: "123" } });

      const result = await createEvent(validParams);

      expect(mockedPost).toHaveBeenCalledWith(
        "/posts",
        expect.objectContaining({
          title: validParams.title,
          type: validParams.type,
          content: validParams.content,
          location: validParams.location,
          groupId: validParams.groupId,
        }),
        expect.any(Object)
      );
    });

    it("deve incluir token no header Authorization", async () => {
      const customToken = "custom-jwt-token-456";
      mockedPost.mockResolvedValue({ data: { id: "123" } });

      await createEvent({
        ...validParams,
        token: customToken,
      });

      expect(mockedPost).toHaveBeenCalledWith(
        "/posts",
        expect.any(Object),
        {
          headers: {
            Authorization: `Bearer ${customToken}`,
          },
        }
      );
    });

    it("deve aceitar content com caracteres especiais", async () => {
      mockedPost.mockResolvedValue({ data: { id: "123" } });

      const specialContent = "Evento especial! 😊 100% confirmado.";
      await createEvent({
        ...validParams,
        content: specialContent,
      });

      expect(mockedPost).toHaveBeenCalledWith(
        "/posts",
        expect.objectContaining({
          content: specialContent,
        }),
        expect.any(Object)
      );
    });

    it("deve aceitar diferentes tipos de evento", async () => {
      mockedPost.mockResolvedValue({ data: { id: "123" } });

      const types = ["Esportes", "Cultural", "Acadêmico", "Social"];

      for (const type of types) {
        await createEvent({
          ...validParams,
          type,
        });
      }

      expect(mockedPost).toHaveBeenCalledTimes(types.length);
    });

    it("deve aceitar diferentes groupIds", async () => {
      mockedPost.mockResolvedValue({ data: { id: "123" } });

      const groupIds = [
        "uuid-1",
        "uuid-2",
        "f9769e23-d7dc-4e61-8fb8-4b8547d16b32",
      ];

      for (const groupId of groupIds) {
        jest.clearAllMocks();
        await createEvent({
          ...validParams,
          groupId,
        });

        expect(mockedPost).toHaveBeenCalledWith(
          "/posts",
          expect.objectContaining({
            groupId,
          }),
          expect.any(Object)
        );
      }
    });
  });

  describe("Edge Cases", () => {
    it("deve lidar com eventFinishDate vazia", async () => {
      mockedPost.mockResolvedValue({ data: { id: "123" } });

      await createEvent({
        ...validParams,
        eventFinishDate: "",
      });

      const callArgs = mockedPost.mock.calls[0];
      expect(callArgs[1].eventFinishDate).toBeUndefined();
    });

    it("deve lidar com location vazia", async () => {
      mockedPost.mockResolvedValue({ data: { id: "123" } });

      await createEvent({
        ...validParams,
        location: "",
      });

      expect(mockedPost).toHaveBeenCalledWith(
        "/posts",
        expect.objectContaining({
          location: "",
        }),
        expect.any(Object)
      );
    });

    it("deve retornar response.data completo", async () => {
      const mockData = {
        id: "event-999",
        title: "Evento Teste",
        type: "Esportes",
        createdAt: "2025-12-13T00:00:00Z",
      };

      mockedPost.mockResolvedValue({ data: mockData });

      const result = await createEvent(validParams);

      expect(result).toEqual(mockData);
    });
  });
});