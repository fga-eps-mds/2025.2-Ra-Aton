import { getFeed, logAxiosError } from "@/libs/auth/handleFeed";
import { api_route } from "@/libs/auth/api";

// Mock da api_route
jest.mock("@/libs/auth/api", () => ({
  api_route: {
    get: jest.fn(),
  },
}));

describe("handleFeed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Silencia logs durante os testes para manter o output limpo
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("getFeed", () => {
    it("deve buscar o feed com os parâmetros de paginação corretos", async () => {
      const mockResponse = {
        data: [{ id: 1, title: "Post" }],
        meta: {
          page: 1,
          limit: 10,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      (api_route.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await getFeed({ page: 1, limit: 10 });

      expect(api_route.get).toHaveBeenCalledWith("/posts", {
        params: { page: "1", limit: "10" },
        signal: undefined,
      });
      expect(result).toEqual(mockResponse);
    });

    it("deve passar o AbortSignal se fornecido", async () => {
      const controller = new AbortController();
      (api_route.get as jest.Mock).mockResolvedValue({ data: {} });

      await getFeed({ page: 1, limit: 10, signal: controller.signal });

      expect(api_route.get).toHaveBeenCalledWith(
        "/posts",
        expect.objectContaining({
          signal: controller.signal,
        }),
      );
    });

    it("deve converter parâmetros numéricos para strings", async () => {
      const mockResponse = { data: [], meta: {} };
      (api_route.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      await getFeed({ page: 5, limit: 20 });

      expect(api_route.get).toHaveBeenCalledWith("/posts", {
        params: { page: "5", limit: "20" },
        signal: undefined,
      });
    });

    it("NÃO deve lançar erro se o status for 400 (retorna undefined)", async () => {
      const error400 = {
        response: { status: 400, data: "Invalid page" },
      };

      (api_route.get as jest.Mock).mockRejectedValue(error400);

      const result = await getFeed({ page: -1, limit: 10 });

      expect(result).toBeUndefined();
    });

    it("DEVE lançar erro para status 401", async () => {
      const error401 = {
        response: { status: 401, data: "Unauthorized" },
      };

      (api_route.get as jest.Mock).mockRejectedValue(error401);

      await expect(getFeed({ page: 1, limit: 10 })).rejects.toEqual(error401);
    });

    it("DEVE lançar erro para status 404", async () => {
      const error404 = {
        response: { status: 404, data: "Not Found" },
      };

      (api_route.get as jest.Mock).mockRejectedValue(error404);

      await expect(getFeed({ page: 1, limit: 10 })).rejects.toEqual(error404);
    });

    it("DEVE lançar erro para status 500", async () => {
      const error500 = {
        response: { status: 500, data: "Server Error" },
      };

      (api_route.get as jest.Mock).mockRejectedValue(error500);

      await expect(getFeed({ page: 1, limit: 10 })).rejects.toEqual(error500);
    });

    it("DEVE lançar erro de rede se não houver resposta", async () => {
      const networkError = {
        request: {},
        response: undefined,
      };

      (api_route.get as jest.Mock).mockRejectedValue(networkError);

      await expect(getFeed({ page: 1, limit: 10 })).rejects.toEqual(
        networkError,
      );
    });
  });

  // Testes para a função auxiliar exportada
  describe("logAxiosError", () => {
    it("deve logar detalhes do erro Axios corretamente", () => {
      const mockAxiosError = {
        response: {
          status: 418,
          data: { message: "I'm a teapot" },
        },
        config: {
          baseURL: "https://api.test",
          url: "/tea",
          params: { sugar: true },
        },
      };

      logAxiosError("TESTE:", mockAxiosError);

      expect(console.log).toHaveBeenCalledWith("TESTE: status:", 418);
      expect(console.log).toHaveBeenCalledWith("TESTE: data:", {
        message: "I'm a teapot",
      });
      expect(console.log).toHaveBeenCalledWith(
        "TESTE: url:",
        "https://api.test/tea",
        "params:",
        { sugar: true },
      );
    });

    it("deve lidar com erro genérico sem quebrar", () => {
      const genericError = new Error("Erro comum");

      logAxiosError("GENERIC:", genericError);

      // Verifica se logou undefined para as props que não existem no Error padrão
      expect(console.log).toHaveBeenCalledWith("GENERIC: status:", undefined);
    });
  });
});
