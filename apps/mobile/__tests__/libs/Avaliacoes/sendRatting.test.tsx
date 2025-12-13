import { sendRatting } from "@/libs/Avaliacoes/sendRatting";
import { api_route } from "@/libs/auth/api";

jest.mock("@/libs/auth/api", () => ({
  api_route: {
    post: jest.fn(),
  },
}));

// Mock do console para evitar logs durante os testes
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe("sendRatting", () => {
  const token = "fake-token";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe("Sucesso", () => {
    it("deve enviar payload corretamente com rating e message", async () => {
      (api_route.post as jest.Mock).mockResolvedValueOnce({
        data: { success: true },
      });

      const response = await sendRatting({ rating: 5, message: "Ótimo!", token });

      expect(api_route.post).toHaveBeenCalledWith(
        "/avaliation",
        { score: 5, message: "Ótimo!" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      expect(response).toEqual({ success: true });
    });

    it("deve usar message vazia como padrão quando não fornecida", async () => {
      (api_route.post as jest.Mock).mockResolvedValueOnce({
        data: { id: "123", score: 4 },
      });

      const response = await sendRatting({ rating: 4, token });

      expect(api_route.post).toHaveBeenCalledWith(
        "/avaliation",
        { score: 4, message: "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      expect(response).toEqual({ id: "123", score: 4 });
    });

    it("deve logar o payload sendo enviado", async () => {
      (api_route.post as jest.Mock).mockResolvedValueOnce({
        data: { success: true },
      });

      await sendRatting({ rating: 3, message: "Bom", token });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[sendRatting] Payload sendo enviado:',
        expect.stringContaining('"score": 3')
      );
    });

    it("deve retornar data completo do response", async () => {
      const mockData = {
        id: "avaliacao-123",
        score: 5,
        message: "Excelente!",
        createdAt: "2025-12-13T00:00:00Z",
      };

      (api_route.post as jest.Mock).mockResolvedValueOnce({
        data: mockData,
      });

      const response = await sendRatting({ 
        rating: 5, 
        message: "Excelente!", 
        token 
      });

      expect(response).toEqual(mockData);
    });
  });

  describe("Erros com Response do Servidor", () => {
    it("deve retornar erro quando backend retorna error", async () => {
      (api_route.post as jest.Mock).mockRejectedValueOnce({
        response: { data: { error: "Erro no backend" } },
      });

      const response = await sendRatting({ rating: 3, token });

      expect(response).toEqual({ error: "Erro no backend" });
    });

    it("deve retornar erro de issues[0].message quando disponível", async () => {
      (api_route.post as jest.Mock).mockRejectedValueOnce({
        response: { 
          data: { 
            issues: [
              { message: "Score deve ser entre 1 e 5" }
            ]
          } 
        },
      });

      const response = await sendRatting({ rating: 6, token });

      expect(response).toEqual({ error: "Score deve ser entre 1 e 5" });
    });

    it("deve priorizar issues[0].message sobre error", async () => {
      (api_route.post as jest.Mock).mockRejectedValueOnce({
        response: { 
          data: { 
            issues: [
              { message: "Erro de validação" }
            ],
            error: "Erro genérico"
          } 
        },
      });

      const response = await sendRatting({ rating: 2, token });

      expect(response).toEqual({ error: "Erro de validação" });
    });

    it("deve usar mensagem padrão quando não há error nem issues", async () => {
      (api_route.post as jest.Mock).mockRejectedValueOnce({
        response: { data: {} },
      });

      const response = await sendRatting({ rating: 1, token });

      expect(response).toEqual({ error: "Erro ao enviar avaliação." });
    });

    it("deve usar mensagem padrão quando data é null", async () => {
      (api_route.post as jest.Mock).mockRejectedValueOnce({
        response: { data: null },
      });

      const response = await sendRatting({ rating: 5, token });

      expect(response).toEqual({ error: "Erro ao enviar avaliação." });
    });

    it("deve lidar com múltiplos issues pegando apenas o primeiro", async () => {
      (api_route.post as jest.Mock).mockRejectedValueOnce({
        response: { 
          data: { 
            issues: [
              { message: "Primeiro erro" },
              { message: "Segundo erro" }
            ]
          } 
        },
      });

      const response = await sendRatting({ rating: 3, token });

      expect(response).toEqual({ error: "Primeiro erro" });
    });
  });

  describe("Erros sem Response (Rede)", () => {
    it("deve lançar erro quando não há resposta do servidor", async () => {
      const mockRequest = { timeout: 5000 };
      (api_route.post as jest.Mock).mockRejectedValueOnce({
        request: mockRequest,
      });

      await expect(sendRatting({ rating: 4, token })).rejects.toThrow(
        "Não foi possível conectar ao servidor."
      );

      expect(mockConsoleError).toHaveBeenCalledWith(
        "Sem resposta do servidor:",
        mockRequest
      );
    });

    it("deve logar erro no console quando há request sem response", async () => {
      (api_route.post as jest.Mock).mockRejectedValueOnce({
        request: { url: "/avaliation" },
      });

      await expect(sendRatting({ rating: 2, token })).rejects.toThrow();

      expect(mockConsoleError).toHaveBeenCalledWith(
        "Sem resposta do servidor:",
        expect.any(Object)
      );
    });
  });

  describe("Erros Inesperados", () => {
    it("deve lançar erro quando não há nem response nem request", async () => {
      (api_route.post as jest.Mock).mockRejectedValueOnce({
        message: "Network error",
      });

      await expect(sendRatting({ rating: 5, token })).rejects.toThrow(
        "Erro inesperado ao enviar avaliação."
      );

      expect(mockConsoleError).toHaveBeenCalledWith(
        "Erro ao enviar avaliação:",
        "Network error"
      );
    });

    it("deve logar mensagem de erro no console", async () => {
      (api_route.post as jest.Mock).mockRejectedValueOnce({
        message: "Timeout exceeded",
      });

      await expect(sendRatting({ rating: 1, token })).rejects.toThrow();

      expect(mockConsoleError).toHaveBeenCalledWith(
        "Erro ao enviar avaliação:",
        "Timeout exceeded"
      );
    });

    it("deve lidar com erro sem message", async () => {
      (api_route.post as jest.Mock).mockRejectedValueOnce({});

      await expect(sendRatting({ rating: 3, token })).rejects.toThrow(
        "Erro inesperado ao enviar avaliação."
      );
    });
  });

  describe("Validação de Parâmetros", () => {
    it("deve aceitar rating mínimo (1)", async () => {
      (api_route.post as jest.Mock).mockResolvedValueOnce({
        data: { success: true },
      });

      const response = await sendRatting({ rating: 1, token });

      expect(api_route.post).toHaveBeenCalledWith(
        "/avaliation",
        { score: 1, message: "" },
        expect.any(Object)
      );
      expect(response).toEqual({ success: true });
    });

    it("deve aceitar rating máximo (5)", async () => {
      (api_route.post as jest.Mock).mockResolvedValueOnce({
        data: { success: true },
      });

      const response = await sendRatting({ rating: 5, token });

      expect(api_route.post).toHaveBeenCalledWith(
        "/avaliation",
        { score: 5, message: "" },
        expect.any(Object)
      );
      expect(response).toEqual({ success: true });
    });

    it("deve incluir token no header Authorization", async () => {
      const customToken = "custom-jwt-token-123";
      (api_route.post as jest.Mock).mockResolvedValueOnce({
        data: { success: true },
      });

      await sendRatting({ rating: 4, token: customToken });

      expect(api_route.post).toHaveBeenCalledWith(
        "/avaliation",
        expect.any(Object),
        { headers: { Authorization: `Bearer ${customToken}` } }
      );
    });

    it("deve aceitar message com caracteres especiais", async () => {
      (api_route.post as jest.Mock).mockResolvedValueOnce({
        data: { success: true },
      });

      const specialMessage = "Ótimo! 😊 100% recomendado.";
      await sendRatting({ rating: 5, message: specialMessage, token });

      expect(api_route.post).toHaveBeenCalledWith(
        "/avaliation",
        { score: 5, message: specialMessage },
        expect.any(Object)
      );
    });

    it("deve aceitar message vazia string explicitamente", async () => {
      (api_route.post as jest.Mock).mockResolvedValueOnce({
        data: { success: true },
      });

      await sendRatting({ rating: 3, message: "", token });

      expect(api_route.post).toHaveBeenCalledWith(
        "/avaliation",
        { score: 3, message: "" },
        expect.any(Object)
      );
    });

    it("deve aceitar message muito longa", async () => {
      (api_route.post as jest.Mock).mockResolvedValueOnce({
        data: { success: true },
      });

      const longMessage = "A".repeat(1000);
      await sendRatting({ rating: 4, message: longMessage, token });

      expect(api_route.post).toHaveBeenCalledWith(
        "/avaliation",
        { score: 4, message: longMessage },
        expect.any(Object)
      );
    });
  });
});
