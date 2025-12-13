import { removeMember } from "@/libs/groupMembership/removeMember";
import { api_route } from "@/libs/auth/api";

jest.mock("@/libs/auth/api");

const mockedApi = api_route as jest.Mocked<typeof api_route>;

describe("removeMember", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve remover membro com sucesso", async () => {
    const membershipId = "membership-123";
    mockedApi.delete.mockResolvedValue({ data: {} });

    await removeMember(membershipId);

    expect(mockedApi.delete).toHaveBeenCalledWith(`/member/${membershipId}`);
    expect(mockedApi.delete).toHaveBeenCalledTimes(1);
  });

  it("deve lançar erro com mensagem da API quando a remoção falhar", async () => {
    const membershipId = "membership-123";
    const errorMessage = "Você não tem permissão para remover este membro";
    
    mockedApi.delete.mockRejectedValue({
      response: {
        data: {
          message: errorMessage,
        },
      },
    });

    await expect(removeMember(membershipId)).rejects.toThrow(errorMessage);
    expect(mockedApi.delete).toHaveBeenCalledWith(`/member/${membershipId}`);
  });

  it("deve lançar erro genérico quando API não retorna mensagem", async () => {
    const membershipId = "membership-123";
    
    mockedApi.delete.mockRejectedValue(new Error("Network error"));

    await expect(removeMember(membershipId)).rejects.toThrow("Erro ao remover membro.");
    expect(mockedApi.delete).toHaveBeenCalledWith(`/member/${membershipId}`);
  });

  it("deve lançar erro quando membro não existe (404)", async () => {
    const membershipId = "nonexistent-membership";
    const errorMessage = "Membro não encontrado";
    
    mockedApi.delete.mockRejectedValue({
      response: {
        status: 404,
        data: {
          message: errorMessage,
        },
      },
    });

    await expect(removeMember(membershipId)).rejects.toThrow(errorMessage);
  });

  it("deve lançar erro quando usuário não tem permissão (403)", async () => {
    const membershipId = "membership-123";
    const errorMessage = "Acesso negado";
    
    mockedApi.delete.mockRejectedValue({
      response: {
        status: 403,
        data: {
          message: errorMessage,
        },
      },
    });

    await expect(removeMember(membershipId)).rejects.toThrow(errorMessage);
  });

  it("deve lançar erro quando não há autenticação (401)", async () => {
    const membershipId = "membership-123";
    const errorMessage = "Não autenticado";
    
    mockedApi.delete.mockRejectedValue({
      response: {
        status: 401,
        data: {
          message: errorMessage,
        },
      },
    });

    await expect(removeMember(membershipId)).rejects.toThrow(errorMessage);
  });

  it("deve funcionar com diferentes IDs de membership", async () => {
    const membershipIds = ["membership-1", "membership-2", "membership-3"];
    mockedApi.delete.mockResolvedValue({ data: {} });

    for (const id of membershipIds) {
      await removeMember(id);
      expect(mockedApi.delete).toHaveBeenCalledWith(`/member/${id}`);
    }

    expect(mockedApi.delete).toHaveBeenCalledTimes(3);
  });

  it("deve lançar erro quando response não tem data", async () => {
    const membershipId = "membership-123";
    
    mockedApi.delete.mockRejectedValue({
      response: {},
    });

    await expect(removeMember(membershipId)).rejects.toThrow("Erro ao remover membro.");
  });

  it("deve lançar erro quando response.data não tem message", async () => {
    const membershipId = "membership-123";
    
    mockedApi.delete.mockRejectedValue({
      response: {
        data: {},
      },
    });

    await expect(removeMember(membershipId)).rejects.toThrow("Erro ao remover membro.");
  });

  it("deve processar erro de servidor interno (500)", async () => {
    const membershipId = "membership-123";
    const errorMessage = "Erro interno do servidor";
    
    mockedApi.delete.mockRejectedValue({
      response: {
        status: 500,
        data: {
          message: errorMessage,
        },
      },
    });

    await expect(removeMember(membershipId)).rejects.toThrow(errorMessage);
  });

  it("deve processar erro de timeout", async () => {
    const membershipId = "membership-123";
    
    mockedApi.delete.mockRejectedValue({
      code: "ECONNABORTED",
      message: "timeout of 5000ms exceeded",
    });

    await expect(removeMember(membershipId)).rejects.toThrow("Erro ao remover membro.");
  });

  it("deve processar erro quando não há conexão", async () => {
    const membershipId = "membership-123";
    
    mockedApi.delete.mockRejectedValue({
      code: "ERR_NETWORK",
      message: "Network Error",
    });

    await expect(removeMember(membershipId)).rejects.toThrow("Erro ao remover membro.");
  });
});
