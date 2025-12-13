import { getGroupMembers } from "@/libs/groupMembership/getGroupMembers";
import { api_route } from "@/libs/auth/api";
import { IGroupMember } from "@/libs/interfaces/IMember";

jest.mock("@/libs/auth/api");

const mockedApi = api_route as jest.Mocked<typeof api_route>;

describe("getGroupMembers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("deve retornar lista de membros quando a requisição for bem-sucedida", async () => {
    const groupId = "group-123";
    const mockMembers: IGroupMember[] = [
      {
        id: "member-1",
        userId: "user-1",
        groupId: "group-123",
        role: "ADMIN",
        joinedAt: new Date("2024-01-01"),
        user: {
          id: "user-1",
          name: "João Silva",
          email: "joao@example.com",
          avatarUrl: "https://example.com/avatar1.jpg",
          username: "joao",
        },
      },
      {
        id: "member-2",
        userId: "user-2",
        groupId: "group-123",
        role: "MEMBER",
        joinedAt: new Date("2024-01-02"),
        user: {
          id: "user-2",
          name: "Maria Santos",
          email: "maria@example.com",
          avatarUrl: null,
          username: "maria",
        },
      },
    ];

    mockedApi.get.mockResolvedValue({ data: mockMembers });

    const result = await getGroupMembers(groupId);

    expect(mockedApi.get).toHaveBeenCalledWith(`/member/group/${groupId}`);
    expect(result).toEqual(mockMembers);
    expect(result).toHaveLength(2);
  });

  it("deve retornar lista vazia quando não há membros", async () => {
    const groupId = "group-empty";
    mockedApi.get.mockResolvedValue({ data: [] });

    const result = await getGroupMembers(groupId);

    expect(mockedApi.get).toHaveBeenCalledWith(`/member/group/${groupId}`);
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it("deve lançar erro quando a API falhar", async () => {
    const groupId = "group-123";
    const error = new Error("Network error");
    mockedApi.get.mockRejectedValue(error);

    await expect(getGroupMembers(groupId)).rejects.toThrow(
      "Não foi possível carregar os membros."
    );

    expect(console.error).toHaveBeenCalledWith("Erro ao buscar membros:", error);
    expect(mockedApi.get).toHaveBeenCalledWith(`/member/group/${groupId}`);
  });

  it("deve lançar erro quando grupo não existe", async () => {
    const groupId = "nonexistent-group";
    const error = { response: { status: 404, data: { message: "Group not found" } } };
    mockedApi.get.mockRejectedValue(error);

    await expect(getGroupMembers(groupId)).rejects.toThrow(
      "Não foi possível carregar os membros."
    );

    expect(console.error).toHaveBeenCalledWith("Erro ao buscar membros:", error);
  });

  it("deve lançar erro quando não há autorização", async () => {
    const groupId = "group-123";
    const error = { response: { status: 401, data: { message: "Unauthorized" } } };
    mockedApi.get.mockRejectedValue(error);

    await expect(getGroupMembers(groupId)).rejects.toThrow(
      "Não foi possível carregar os membros."
    );

    expect(console.error).toHaveBeenCalledWith("Erro ao buscar membros:", error);
  });

  it("deve processar membros com diferentes roles corretamente", async () => {
    const groupId = "group-123";
    const mockMembers: IGroupMember[] = [
      {
        id: "member-1",
        userId: "user-1",
        groupId: "group-123",
        role: "ADMIN",
        joinedAt: new Date("2024-01-01"),
        user: {
          id: "user-1",
          name: "Admin User",
          email: "admin@example.com",
          avatarUrl: null,
          username: "admin",
        },
      },
      {
        id: "member-2",
        userId: "user-2",
        groupId: "group-123",
        role: "MEMBER",
        joinedAt: new Date("2024-01-02"),
        user: {
          id: "user-2",
          name: "Regular Member",
          email: "member@example.com",
          avatarUrl: null,
          username: "member",
        },
      },
    ];

    mockedApi.get.mockResolvedValue({ data: mockMembers });

    const result = await getGroupMembers(groupId);

    expect(result[0].role).toBe("ADMIN");
    expect(result[1].role).toBe("MEMBER");
  });

  it("deve processar membros sem avatarUrl corretamente", async () => {
    const groupId = "group-123";
    const mockMembers: IGroupMember[] = [
      {
        id: "member-1",
        userId: "user-1",
        groupId: "group-123",
        role: "MEMBER",
        joinedAt: new Date("2024-01-01"),
        user: {
          id: "user-1",
          name: "User Without Avatar",
          email: "user@example.com",
          avatarUrl: null,
          username: "user",
        },
      },
    ];

    mockedApi.get.mockResolvedValue({ data: mockMembers });

    const result = await getGroupMembers(groupId);

    expect(result[0].user.avatarUrl).toBeNull();
  });

  it("deve processar membros com avatarUrl corretamente", async () => {
    const groupId = "group-123";
    const avatarUrl = "https://example.com/avatar.jpg";
    const mockMembers: IGroupMember[] = [
      {
        id: "member-1",
        userId: "user-1",
        groupId: "group-123",
        role: "MEMBER",
        joinedAt: new Date("2024-01-01"),
        user: {
          id: "user-1",
          name: "User With Avatar",
          email: "user@example.com",
          avatarUrl: avatarUrl,
          username: "user",
        },
      },
    ];

    mockedApi.get.mockResolvedValue({ data: mockMembers });

    const result = await getGroupMembers(groupId);

    expect(result[0].user.avatarUrl).toBe(avatarUrl);
  });

  it("deve funcionar com diferentes IDs de grupo", async () => {
    const groupIds = ["group-1", "group-2", "group-3"];
    mockedApi.get.mockResolvedValue({ data: [] });

    for (const groupId of groupIds) {
      await getGroupMembers(groupId);
      expect(mockedApi.get).toHaveBeenCalledWith(`/member/group/${groupId}`);
    }

    expect(mockedApi.get).toHaveBeenCalledTimes(3);
  });
});
