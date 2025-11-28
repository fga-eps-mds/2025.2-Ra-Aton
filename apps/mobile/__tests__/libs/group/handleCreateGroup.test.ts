// ARQUIVO: apps/mobile/__tests__/libs/group/handleCreateGroup.test.ts

// 1. Mockamos o módulo usando caminho RELATIVO para evitar erro de resolução
jest.mock("../../../libs/auth/api", () => {
  return {
    api_route: {
      post: jest.fn(),
    },
  };
});

// 2. Importamos a função que queremos testar
import {
  handleCreateGroup,
  CreateGroupPayload,
} from "../../../libs/group/handleCreateGroup";

// 3. Acessamos o mock usando o mesmo caminho relativo
const { api_route } = require("../../../libs/auth/api");
const mockedApiPost = api_route.post;

describe("handleCreateGroup", () => {
  beforeEach(() => {
    mockedApiPost.mockClear();
  });

  it('deve chamar a API com a URL correta e SEM o campo "type" no payload', async () => {
    const mockResponse = {
      data: {
        message: "Grupo criado",
        group: {
          id: "123",
          name: "Grupo Teste",
          description: "Desc",
          groupType: "ATHLETIC",
        },
      },
    };
    mockedApiPost.mockResolvedValue(mockResponse);

    const payload: CreateGroupPayload = {
      name: "Grupo Teste",
      description: "Desc",
      type: "ATHLETIC",
      verificationRequest: true,
      acceptingNewMembers: true,
      sports: ["Futebol"],
    };

    const result = await handleCreateGroup(payload);

    expect(result).toEqual(mockResponse.data.group);

    expect(mockedApiPost).toHaveBeenCalledWith(
      "/group",
      expect.objectContaining({
        name: "Grupo Teste",
        verificationRequest: true,
      }),
    );

    // Verifica que 'type' foi removido
    const args = mockedApiPost.mock.calls[0];
    const sentPayload = args[1];
    expect(sentPayload).not.toHaveProperty("type");
  });

  it("deve lançar erro formatado quando a API falhar", async () => {
    const errorMessage = "Nome já está em uso";
    mockedApiPost.mockRejectedValue({
      response: {
        data: { message: errorMessage },
      },
    });

    const payload: CreateGroupPayload = {
      name: "Grupo Duplicado",
      verificationRequest: true,
      type: "AMATEUR",
    };

    await expect(handleCreateGroup(payload)).rejects.toThrow(errorMessage);
  });
});
