import { sendRatting } from "@/libs/Avaliacoes/sendRatting";
import { api_route } from "@/libs/auth/api";

jest.mock("@/libs/auth/api", () => ({
  api_route: {
    post: jest.fn(),
  },
}));

describe("sendRatting", () => {
  const token = "fake-token";

  it("envia payload corretamente e retorna dados do servidor", async () => {
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

  it("retorna erro do backend corretamente", async () => {
    (api_route.post as jest.Mock).mockRejectedValueOnce({
      response: { data: { error: "Erro no backend" } },
    });

    const response = await sendRatting({ rating: 3, token });

    expect(response).toEqual({ error: "Erro no backend" });
  });

  it("lança erro quando não há resposta do servidor", async () => {
    (api_route.post as jest.Mock).mockRejectedValueOnce({
      request: {},
    });

    await expect(sendRatting({ rating: 4, token })).rejects.toThrow(
      "Não foi possível conectar ao servidor."
    );
  });
});
