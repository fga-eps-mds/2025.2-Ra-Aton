import { userService } from "../../modules/user/user.service";
import userRepository from "../../modules/user/user.repository";
import bcrypt from "bcryptjs";

// TODO: adicionar testes para caminhos tristes
// TODO: adicionar testes para update, delete e getAllUsers

// Mock do repositório de usuários
jest.mock("../../modules/user/user.repository");

describe("UserService", () => {
  // Limpar mocks entre testes
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create a user", async () => {
      // Arrange
      const mockUser = {
        name: "Test User",
        userName: "testuser",
        email: "test@example.com",
        password: "testpassword",
      };

      // Mock da senha
        jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedPassword");

      const repo = jest.mocked(userRepository);

      repo.findByEmail.mockResolvedValue(null as any); 

      const now = new Date();
        repo.create.mockResolvedValue({
          id: "u_1",
          name: mockUser.name,
          userName: mockUser.userName,
          email: mockUser.email,
          profileType: null,
          passwordHash: "hashedPassword",
          createdAt: now,
          updatedAt: now,
        } as any);

      // Act
      const result = await userService.createUser(mockUser);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(
        mockUser.password, 10,
      );

      expect(repo.create).toHaveBeenCalledTimes(1);
      expect(repo.create).toHaveBeenCalledWith({
        name: mockUser.name,
        userName: mockUser.userName,
        email: mockUser.email,
        passwordHash: "hashedPassword",
      });

      expect(userRepository.create).toHaveBeenCalledWith(
        {
          name: mockUser.name,
          userName: mockUser.userName,
          email: mockUser.email,
          passwordHash: "hashedPassword",
        },
      );

      expect(result).toMatchObject({
        id: "u_1",
        name: "Test User",
        userName: "testuser",
        profileType: null, // ProfileType é alterado depois do primeiro login
        email: "test@example.com",
      }); // Verifica se a senha não é retornada
    expect((result as any).passwordHash).toBeUndefined();
    expect((result as any).password).toBeUndefined();
    });
  });

  describe("getUserById", () => {
    it("should return a user by id", async () => {
      // Arrange
      const mockUser = {
        id: "u_1",
        name: "Test User",
        userName: "testuser",
        profileType: null,
        email: "test@example.com",
        passwordHash: "hashedPassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const repo = jest.mocked(userRepository);

      repo.findById.mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserById("u_1");

      // Assert
      expect(repo.findById).toHaveBeenCalledWith("u_1");
      expect(repo.findById).toHaveBeenCalledTimes(1);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...mockUserWithoutPassword } = mockUser;
      expect(result).toMatchObject({
        ...mockUserWithoutPassword,
      });
    });
  });
});
