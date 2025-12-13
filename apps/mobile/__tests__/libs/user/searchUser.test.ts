import { searchUsers, IUserPreview } from "@/libs/user/searchUsers";
import { api_route } from "@/libs/auth/api";

jest.mock("@/libs/auth/api");

const mockedApi = api_route as jest.Mocked<typeof api_route>;

describe("searchUsers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockUsers: IUserPreview[] = [
    {
      id: "1",
      name: "João Silva",
      userName: "joaosilva",
      profilePicture: "https://example.com/joao.jpg",
      email: "joao@example.com",
    },
    {
      id: "2",
      name: "Maria Santos",
      userName: "mariasantos",
      profilePicture: "https://example.com/maria.jpg",
      email: "maria@example.com",
    },
    {
      id: "3",
      name: "Pedro Oliveira",
      userName: "pedrooliveira",
      email: "pedro@example.com",
    },
    {
      id: "4",
      name: "Ana Costa",
      userName: "anacosta",
      profilePicture: "https://example.com/ana.jpg",
      email: "ana@example.com",
    },
    {
      id: "5",
      name: "Carlos Ferreira",
      userName: "carlosferreira",
      email: "carlos@example.com",
    },
  ];

  it("deve buscar usuários por nome (case-insensitive)", async () => {
    mockedApi.get.mockResolvedValue({ data: mockUsers });

    const result = await searchUsers("joão");

    expect(mockedApi.get).toHaveBeenCalledWith("/users");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("João Silva");
  });

  it("deve buscar usuários por userName (case-insensitive)", async () => {
    mockedApi.get.mockResolvedValue({ data: mockUsers });

    const result = await searchUsers("MARIASANTOS");

    expect(result).toHaveLength(1);
    expect(result[0].userName).toBe("mariasantos");
  });

  it("deve buscar usuários por email (case-insensitive)", async () => {
    mockedApi.get.mockResolvedValue({ data: mockUsers });

    const result = await searchUsers("pedro@example.com");

    expect(result).toHaveLength(1);
    expect(result[0].email).toBe("pedro@example.com");
  });

  it("deve buscar usuários por parte do nome", async () => {
    mockedApi.get.mockResolvedValue({ data: mockUsers });

    const result = await searchUsers("silva");

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("João Silva");
  });

  it("deve buscar usuários por parte do userName", async () => {
    mockedApi.get.mockResolvedValue({ data: mockUsers });

    const result = await searchUsers("santos");

    expect(result).toHaveLength(1);
    expect(result[0].userName).toBe("mariasantos");
  });

  it("deve buscar usuários por parte do email", async () => {
    mockedApi.get.mockResolvedValue({ data: mockUsers });

    const result = await searchUsers("example.com");

    expect(result).toHaveLength(5);
  });

  it("deve retornar múltiplos usuários quando a busca coincide com vários", async () => {
    mockedApi.get.mockResolvedValue({ data: mockUsers });

    const result = await searchUsers("a");

    expect(result.length).toBeGreaterThan(1);
  });

  it("deve retornar array vazio quando query está vazia", async () => {
    mockedApi.get.mockResolvedValue({ data: mockUsers });

    const result = await searchUsers("");

    expect(result).toEqual([]);
    expect(mockedApi.get).toHaveBeenCalled();
  });

  it("deve retornar array vazio quando query contém apenas espaços", async () => {
    mockedApi.get.mockResolvedValue({ data: mockUsers });

    const result = await searchUsers("   ");

    expect(result).toEqual([]);
  });

  it("deve remover espaços em branco da query antes de buscar", async () => {
    mockedApi.get.mockResolvedValue({ data: mockUsers });

    const result = await searchUsers("  joão  ");

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("João Silva");
  });

  it("deve retornar array vazio quando nenhum usuário coincide", async () => {
    mockedApi.get.mockResolvedValue({ data: mockUsers });

    const result = await searchUsers("UsuarioInexistente123");

    expect(result).toEqual([]);
  });

  it("deve limitar resultados a 10 usuários", async () => {
    const manyUsers: IUserPreview[] = Array.from({ length: 15 }, (_, i) => ({
      id: `${i}`,
      name: `Usuario ${i}`,
      userName: `usuario${i}`,
      email: `usuario${i}@example.com`,
    }));

    mockedApi.get.mockResolvedValue({ data: manyUsers });

    const result = await searchUsers("usuario");

    expect(result).toHaveLength(10);
  });

  it("deve funcionar com usuários sem email", async () => {
    const usersWithoutEmail: IUserPreview[] = [
      {
        id: "1",
        name: "João Silva",
        userName: "joaosilva",
        profilePicture: "https://example.com/joao.jpg",
      },
      {
        id: "2",
        name: "Maria Santos",
        userName: "mariasantos",
      },
    ];

    mockedApi.get.mockResolvedValue({ data: usersWithoutEmail });

    const result = await searchUsers("joão");

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("João Silva");
  });

  it("deve retornar array vazio quando a API retorna erro", async () => {
    mockedApi.get.mockRejectedValue(new Error("Network error"));

    const result = await searchUsers("joão");

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      "Erro na busca local de usuários:",
      expect.any(Error)
    );
  });

  it("deve retornar array vazio quando a API retorna array vazio", async () => {
    mockedApi.get.mockResolvedValue({ data: [] });

    const result = await searchUsers("joão");

    expect(result).toEqual([]);
  });

  it("deve funcionar com caracteres especiais na query", async () => {
    const usersWithSpecialChars: IUserPreview[] = [
      {
        id: "1",
        name: "José D'Angelo",
        userName: "josedangelo",
        email: "jose@example.com",
      },
    ];

    mockedApi.get.mockResolvedValue({ data: usersWithSpecialChars });

    const result = await searchUsers("d'angelo");

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("José D'Angelo");
  });

  it("deve funcionar com acentos na query", async () => {
    const usersWithAccents: IUserPreview[] = [
      {
        id: "1",
        name: "José Ângelo",
        userName: "joseangelo",
        email: "jose@example.com",
      },
    ];

    mockedApi.get.mockResolvedValue({ data: usersWithAccents });

    const result = await searchUsers("ângelo");

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("José Ângelo");
  });

  it("deve buscar por nome completo", async () => {
    mockedApi.get.mockResolvedValue({ data: mockUsers });

    const result = await searchUsers("João Silva");

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("João Silva");
  });

  it("deve priorizar busca case-insensitive corretamente", async () => {
    mockedApi.get.mockResolvedValue({ data: mockUsers });

    const result = await searchUsers("JOÃO SILVA");

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("João Silva");
  });

  it("deve funcionar com usuários que não têm profilePicture", async () => {
    mockedApi.get.mockResolvedValue({ data: mockUsers });

    const result = await searchUsers("carlos");

    expect(result).toHaveLength(1);
    expect(result[0].profilePicture).toBeUndefined();
  });

  it("deve buscar por domínio de email", async () => {
    mockedApi.get.mockResolvedValue({ data: mockUsers });

    const result = await searchUsers("@example");

    expect(result.length).toBeGreaterThan(0);
  });

  it("deve buscar números no userName", async () => {
    const usersWithNumbers: IUserPreview[] = [
      {
        id: "1",
        name: "User Test",
        userName: "user123",
        email: "user@example.com",
      },
    ];

    mockedApi.get.mockResolvedValue({ data: usersWithNumbers });

    const result = await searchUsers("123");

    expect(result).toHaveLength(1);
    expect(result[0].userName).toBe("user123");
  });

  it("deve tratar erro 404 da API", async () => {
    mockedApi.get.mockRejectedValue({
      response: {
        status: 404,
        data: { message: "Endpoint não encontrado" },
      },
    });

    const result = await searchUsers("joão");

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  it("deve tratar erro 500 da API", async () => {
    mockedApi.get.mockRejectedValue({
      response: {
        status: 500,
        data: { message: "Erro interno do servidor" },
      },
    });

    const result = await searchUsers("joão");

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  it("deve chamar endpoint correto", async () => {
    mockedApi.get.mockResolvedValue({ data: mockUsers });

    await searchUsers("joão");

    expect(mockedApi.get).toHaveBeenCalledWith("/users");
    expect(mockedApi.get).toHaveBeenCalledTimes(1);
  });
});
