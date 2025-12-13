import { sendInvite } from "@/libs/groupMembership/sendInvite";
import { api_route } from "@/libs/auth/api";
import { IInvitePayload } from "@/libs/interfaces/IMember";

jest.mock("@/libs/auth/api");

const mockedApi = api_route as jest.Mocked<typeof api_route>;

describe("sendInvite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("deve enviar convite com sucesso quando targetUserId é fornecido", async () => {
    const payload: IInvitePayload = {
      groupId: "group-123",
      targetUserId: "user-456",
      message: "Junte-se ao nosso grupo!",
    };

    mockedApi.post.mockResolvedValue({ data: {} });

    await sendInvite(payload);

    expect(mockedApi.post).toHaveBeenCalledWith("/invite", {
      userId: "user-456",
      groupId: "group-123",
      madeBy: "GROUP",
      message: "Junte-se ao nosso grupo!",
    });
    expect(mockedApi.post).toHaveBeenCalledTimes(1);
  });

  it("deve usar mensagem padrão quando message não é fornecida", async () => {
    const payload: IInvitePayload = {
      groupId: "group-123",
      targetUserId: "user-456",
    };

    mockedApi.post.mockResolvedValue({ data: {} });

    await sendInvite(payload);

    expect(mockedApi.post).toHaveBeenCalledWith("/invite", {
      userId: "user-456",
      groupId: "group-123",
      madeBy: "GROUP",
      message: "Você foi convidado para o grupo!",
    });
  });

  it("deve buscar usuário por email quando targetEmail é fornecido sem targetUserId", async () => {
    const payload: IInvitePayload = {
      groupId: "group-123",
      targetEmail: "user@example.com",
    };

    const mockUsers = [{ id: "user-789", email: "user@example.com" }];
    mockedApi.get.mockResolvedValue({ data: mockUsers });
    mockedApi.post.mockResolvedValue({ data: {} });

    await sendInvite(payload);

    expect(mockedApi.get).toHaveBeenCalledWith("/users", {
      params: { search: "user@example.com", limit: 1 },
    });
    expect(mockedApi.post).toHaveBeenCalledWith("/invite", {
      userId: "user-789",
      groupId: "group-123",
      madeBy: "GROUP",
      message: "Você foi convidado para o grupo!",
    });
  });

  it("deve lançar erro quando email não retorna usuários", async () => {
    const payload: IInvitePayload = {
      groupId: "group-123",
      targetEmail: "nonexistent@example.com",
    };

    mockedApi.get.mockResolvedValue({ data: [] });

    await expect(sendInvite(payload)).rejects.toThrow(
      "Não foi possível localizar o usuário pelo e-mail."
    );

    expect(mockedApi.get).toHaveBeenCalledWith("/users", {
      params: { search: "nonexistent@example.com", limit: 1 },
    });
    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  it("deve lançar erro quando busca por email falha", async () => {
    const payload: IInvitePayload = {
      groupId: "group-123",
      targetEmail: "user@example.com",
    };

    mockedApi.get.mockRejectedValue(new Error("Network error"));

    await expect(sendInvite(payload)).rejects.toThrow(
      "Não foi possível localizar o usuário pelo e-mail."
    );

    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  it("deve lançar erro quando nem targetUserId nem targetEmail são fornecidos", async () => {
    const payload: IInvitePayload = {
      groupId: "group-123",
    };

    await expect(sendInvite(payload)).rejects.toThrow(
      "ID do usuário alvo é obrigatório."
    );

    expect(mockedApi.get).not.toHaveBeenCalled();
    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  it("deve lançar erro com mensagem do backend quando POST falha", async () => {
    const payload: IInvitePayload = {
      groupId: "group-123",
      targetUserId: "user-456",
    };

    const errorMessage = "Usuário já foi convidado";
    mockedApi.post.mockRejectedValue({
      response: {
        data: {
          message: errorMessage,
        },
      },
    });

    await expect(sendInvite(payload)).rejects.toThrow(errorMessage);
    expect(console.error).toHaveBeenCalled();
  });

  it("deve lançar erro com campo error do backend quando message não existe", async () => {
    const payload: IInvitePayload = {
      groupId: "group-123",
      targetUserId: "user-456",
    };

    const errorMessage = "Validation failed";
    mockedApi.post.mockRejectedValue({
      response: {
        data: {
          error: errorMessage,
        },
      },
    });

    await expect(sendInvite(payload)).rejects.toThrow(errorMessage);
  });

  it("deve lançar erro genérico quando backend não retorna mensagem", async () => {
    const payload: IInvitePayload = {
      groupId: "group-123",
      targetUserId: "user-456",
    };

    mockedApi.post.mockRejectedValue(new Error("Network error"));

    await expect(sendInvite(payload)).rejects.toThrow("Network error");
  });

  it("deve lançar erro de conexão quando não há response", async () => {
    const payload: IInvitePayload = {
      groupId: "group-123",
      targetUserId: "user-456",
    };

    mockedApi.post.mockRejectedValue({
      code: "ERR_NETWORK",
    });

    await expect(sendInvite(payload)).rejects.toThrow(
      "Erro ao enviar convite."
    );
  });

  it("deve preferir targetUserId quando ambos targetUserId e targetEmail são fornecidos", async () => {
    const payload: IInvitePayload = {
      groupId: "group-123",
      targetUserId: "user-456",
      targetEmail: "user@example.com",
    };

    mockedApi.post.mockResolvedValue({ data: {} });

    await sendInvite(payload);

    // Não deve chamar GET /users porque targetUserId já está presente
    expect(mockedApi.get).not.toHaveBeenCalled();
    expect(mockedApi.post).toHaveBeenCalledWith("/invite", {
      userId: "user-456",
      groupId: "group-123",
      madeBy: "GROUP",
      message: "Você foi convidado para o grupo!",
    });
  });

  it("deve processar mensagem customizada longa", async () => {
    const payload: IInvitePayload = {
      groupId: "group-123",
      targetUserId: "user-456",
      message: "Esta é uma mensagem muito longa de convite com várias informações sobre o grupo e porque você deveria participar.",
    };

    mockedApi.post.mockResolvedValue({ data: {} });

    await sendInvite(payload);

    expect(mockedApi.post).toHaveBeenCalledWith("/invite", expect.objectContaining({
      message: expect.any(String),
    }));
  });

  it("deve processar erro 403 (sem permissão)", async () => {
    const payload: IInvitePayload = {
      groupId: "group-123",
      targetUserId: "user-456",
    };

    mockedApi.post.mockRejectedValue({
      response: {
        status: 403,
        data: {
          message: "Você não tem permissão para convidar membros",
        },
      },
    });

    await expect(sendInvite(payload)).rejects.toThrow(
      "Você não tem permissão para convidar membros"
    );
  });

  it("deve processar erro 404 (grupo não encontrado)", async () => {
    const payload: IInvitePayload = {
      groupId: "nonexistent-group",
      targetUserId: "user-456",
    };

    mockedApi.post.mockRejectedValue({
      response: {
        status: 404,
        data: {
          message: "Grupo não encontrado",
        },
      },
    });

    await expect(sendInvite(payload)).rejects.toThrow("Grupo não encontrado");
  });

  it("deve logar informações de debug", async () => {
    const payload: IInvitePayload = {
      groupId: "group-123",
      targetUserId: "user-456",
      message: "Test message",
    };

    mockedApi.post.mockResolvedValue({ data: {} });

    await sendInvite(payload);

    expect(console.log).toHaveBeenCalledWith("Enviando convite:", {
      userId: "user-456",
      groupId: "group-123",
      madeBy: "GROUP",
      message: "Test message",
    });
  });

  it("deve buscar usuário quando GET retorna array com múltiplos usuários", async () => {
    const payload: IInvitePayload = {
      groupId: "group-123",
      targetEmail: "user@example.com",
    };

    const mockUsers = [
      { id: "user-789", email: "user@example.com" },
      { id: "user-790", email: "user@example.com" },
    ];
    mockedApi.get.mockResolvedValue({ data: mockUsers });
    mockedApi.post.mockResolvedValue({ data: {} });

    await sendInvite(payload);

    // Deve usar o primeiro usuário retornado
    expect(mockedApi.post).toHaveBeenCalledWith("/invite", expect.objectContaining({
      userId: "user-789",
    }));
  });
});
