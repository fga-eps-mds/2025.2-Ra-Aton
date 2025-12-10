jest.mock("@/libs/auth/api", () => ({
  api_route: {
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

import { getAllMatchesByUserId, updateMatch, deleteMatch } from "@/libs/auth/handleMyMatches";
import { api_route } from "@/libs/auth/api";

describe("handleMyMatches API", () => {
  it("getAllMatchesByUserId retorna array", async () => {
    const dataMock = { data: [{ id: "1" }] };
    (api_route.get as jest.Mock).mockResolvedValue(dataMock);

    const result = await getAllMatchesByUserId();
    expect(result).toEqual(dataMock.data);
  });

  it("updateMatch faz PATCH corretamente", async () => {
    const matchMock = { id: "1", title: "Nova partida" };
    (api_route.patch as jest.Mock).mockResolvedValue({ data: matchMock });

    const result = await updateMatch("1", { title: "Nova partida" });
    expect(result).toEqual(matchMock);
  });

  it("deleteMatch faz DELETE corretamente", async () => {
    (api_route.delete as jest.Mock).mockResolvedValue({});
    await deleteMatch("1", "token");
    expect(api_route.delete).toHaveBeenCalledWith("/match/1", { headers: { Authorization: "Bearer token" } });
  });
});
