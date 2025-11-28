import followRepository from '../../modules/follow/follow.repository';
// Importe o seu mock configurado (ajuste o caminho conforme seu projeto)
import { prismaMock } from "../prisma-mock";

const USER_ID = 'user-uuid-123';
const GROUP_ID = 'group-uuid-456';
const FOLLOW_ID = 'follow-uuid-789';

// Objeto mockado base
const mockFollow = {
  id: FOLLOW_ID,
  userId: USER_ID,
  groupId: GROUP_ID,
  createdAt: new Date(),
  group: {
    id: GROUP_ID,
    name: 'Grupo de Teste',
    description: 'Descrição teste',
    // ... outros campos do grupo se necessário
  },
};

describe('FollowRepository', () => {
  // Limpa o estado dos mocks após cada teste
  afterEach(() => {
    jest.clearAllMocks();
  });

  // =====================================
  // Testes para findFollow
  // =====================================
  describe('findFollow', () => {
    it('deve retornar o objeto de follow se existir', async () => {
      // Arrange
      prismaMock.groupFollow.findUnique.mockResolvedValue(mockFollow as any);

      // Act
      const result = await followRepository.findFollow(USER_ID, GROUP_ID);

      // Assert
      expect(result).toEqual(mockFollow);
      expect(prismaMock.groupFollow.findUnique).toHaveBeenCalledWith({
        where: {
          userId_groupId: {
            userId: USER_ID,
            groupId: GROUP_ID,
          },
        },
      });
    });

    it('deve retornar null se o follow não existir', async () => {
      // Arrange
      prismaMock.groupFollow.findUnique.mockResolvedValue(null);

      // Act
      const result = await followRepository.findFollow(USER_ID, GROUP_ID);

      // Assert
      expect(result).toBeNull();
    });
  });

  // =====================================
  // Testes para createFollow
  // =====================================
  describe('createFollow', () => {
    it('deve criar um novo follow e retornar o objeto criado', async () => {
      // Arrange
      // O create retorna o objeto criado
      prismaMock.groupFollow.create.mockResolvedValue(mockFollow as any);

      // Act
      const result = await followRepository.createFollow(USER_ID, GROUP_ID);

      // Assert
      expect(result).toEqual(mockFollow);
      expect(prismaMock.groupFollow.create).toHaveBeenCalledWith({
        data: {
          userId: USER_ID,
          groupId: GROUP_ID,
        },
      });
    });
  });

  // =====================================
  // Testes para deleteFollow
  // =====================================
  describe('deleteFollow', () => {
    it('deve chamar prisma.groupFollow.delete para remover o follow', async () => {
      // Arrange
      prismaMock.groupFollow.delete.mockResolvedValue(mockFollow as any);

      // Act
      await followRepository.deleteFollow(USER_ID, GROUP_ID);

      // Assert
      expect(prismaMock.groupFollow.delete).toHaveBeenCalledWith({
        where: {
          userId_groupId: {
            userId: USER_ID,
            groupId: GROUP_ID,
          },
        },
      });
    });
  });

  // =====================================
  // Testes para findGroupsFollowedByUser
  // =====================================
  describe('findGroupsFollowedByUser', () => {
    const limit = 10;
    const offset = 0;

    it('deve retornar lista de grupos e contagem total', async () => {
      // Arrange
      const mockList = [mockFollow]; // Lista de follows com o grupo incluso
      const totalCount = 1;

      // Mock da transação: [lista_de_follows, count]
      (prismaMock.$transaction as jest.Mock).mockResolvedValue([
        mockList,
        totalCount,
      ] as any);

      // Act
      const result = await followRepository.findGroupsFollowedByUser(USER_ID, limit, offset);

      // Assert
      expect(result.groups).toHaveLength(1);
      expect(result.groups[0]).toEqual(mockFollow.group);
      expect(result.totalCount).toBe(totalCount);

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it('deve retornar lista vazia se o usuário não seguir ninguém', async () => {
      // Arrange
      (prismaMock.$transaction as jest.Mock).mockResolvedValue([[], 0] as any);

      // Act
      const result = await followRepository.findGroupsFollowedByUser(USER_ID, limit, offset);

      // Assert
      expect(result.groups).toEqual([]);
      expect(result.totalCount).toBe(0);
    });
  });
});