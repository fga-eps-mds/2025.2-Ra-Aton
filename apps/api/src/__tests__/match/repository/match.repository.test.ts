/* eslint-disable */
import { TeamSide, PlayerSubscription, MatchStatus, ProfileType } from "@prisma/client";
import { prismaMock } from "../../prisma-mock";

// Reset modules to ensure our mocks are used when the repository module is required.
jest.resetModules();

// Build a stub that delegates the model create calls to the deep mock functions
// we control, and provides a $transaction implementation that executes the
// transaction callback passing this stub as `tx`.
const prismaStub = {
  match: {
    create: prismaMock.match.create,
    update: prismaMock.match.update,
    findMany: prismaMock.match.findMany,
    findUnique: prismaMock.match.findUnique,
    delete: prismaMock.match.delete,
    count: prismaMock.match.count,
    deleteMany: prismaMock.match.deleteMany,
  },
  playerSubscription: {
    create: prismaMock.playerSubscription.create,
    findUnique: prismaMock.playerSubscription.findUnique,
    update: prismaMock.playerSubscription.update,
    delete: prismaMock.playerSubscription.delete,
    deleteMany: prismaMock.playerSubscription.deleteMany,
  },
  // Support both forms of $transaction used by the repository:
  // - function callback: prisma.$transaction(async (tx) => { ... })
  // - array form: prisma.$transaction([prisma.match.findMany(...), prisma.match.count()])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $transaction: jest.fn().mockImplementation(async (arg: any) => {
    if (Array.isArray(arg)) {
      // assume items are promises from prisma mock functions
      return Promise.all(arg);
    }
    return arg(prismaStub);
  }),
};

// Import the repository class and instantiate it with our stubbed prisma
import { MatchRepository } from "../../../modules/match/match.repository";
const matchRepository = new MatchRepository(prismaStub as any);

describe("MatchRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createMatch", () => {
    it("should create a new match and subscribe the author", async () => {
      // Arrange
      const author = {
        id: "author-id",
        userName: "authorUser",
        email: "author@example",
        name: "Author Name",
        profileType: ProfileType.ATLETICA,
        passwordHash: "hashedPassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const matchData = {
        userId: "author-id",
        title: "Match 1",
        description: "Description for Match 1",
        MatchDate: new Date(),
        teamNameA: "Team A",
        teamNameB: "Team B",
        location: "Stadium A",
        sport: "futsal",
        maxPlayers: 22,
      };

      const createdMatch = {
        id: "match-id",
        authorId: "author-id",
        title: "Match 1",
        description: "Description for Match 1",
        MatchDate: new Date(),
        teamNameA: "Team A",
        teamAScore: 0,
        teamNameB: "Team B",
        teamBScore: 0,
        location: "Stadium A",
        sport: "futsal",
        maxPlayers: 22,
        MatchStatus: MatchStatus.EM_BREVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.match.create.mockResolvedValue(createdMatch);

      prismaMock.playerSubscription.create.mockResolvedValue({
        userId: "author-id",
        matchId: "match-id",
        team: TeamSide.A,
      } as PlayerSubscription);

      // Act
      const result = await matchRepository.createMatch(matchData, author);

      // Assert
      expect(prismaStub.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.match.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(createdMatch);
    });

    it("should throw an error if match creation fails", async () => {
      // Arrange
      const author = {
        id: "author-id",
        userName: "authorUser",
        email: "author@example",
        name: "Author Name",
        profileType: ProfileType.ATLETICA,
        passwordHash: "hashedPassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const matchData = {
        userId: "author-id",
        title: "Match 1",
        description: "Description for Match 1",
        MatchDate: new Date(),
        teamNameA: "Team A",
        teamNameB: "Team B",
        location: "Stadium A",
        maxPlayers: 22,
      };

      prismaMock.match.create.mockRejectedValue(new Error("Database error"));

      // Act & Assert
      await expect(
        matchRepository.createMatch(matchData, author),
      ).rejects.toThrow("Database error");

      expect(prismaStub.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateMatch", () => {
    it("should update an existing match", async () => {
      // Arrange
      const matchId = "match-id";
      const matchData = {
        title: "Updatable Match",
        description: "Updatable description",
        MatchDate: new Date(),
        teamNameA: "Updatable Team A",
        teamAScore: 3,
        teamNameB: "Updatable Team B",
        teamBScore: 2,
        location: "Updatable Stadium",
        sport: "futsal",
        maxPlayers: 22,
      };

      const updatedMatch = {
        id: matchId,
        authorId: "author-id",
        title: "Updated Match",
        description: "Updated description",
        MatchDate: new Date(),
        teamNameA: "Updated Team A",
        teamAScore: 3,
        teamNameB: "Updatable Team B",
        teamBScore: 2,
        location: "Updated Stadium",
        sport: "futsal",
        maxPlayers: 22,
        MatchStatus: MatchStatus.EM_BREVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      prismaMock.match.update.mockResolvedValue(updatedMatch);

      // Act
      const result = await matchRepository.updateMatch(matchId, matchData);

      // Assert
      expect(prismaMock.match.update).toHaveBeenCalledWith({
        where: { id: matchId },
        data: matchData,
      });
      expect(result).toEqual(updatedMatch);
    });

    it("should throw an error if match update fails", async () => {
      // Arrange
      const matchId = "match-id";
      const matchData = { title: "Fail Match" };

      prismaMock.match.update.mockRejectedValue(new Error("Database error"));

      // Act & Assert
      await expect(
        matchRepository.updateMatch(matchId, matchData),
      ).rejects.toThrow("Database error");
    });
  });

  describe("deleteMatch", () => {
    it("should delete an existing match", async () => {
      // Arrange
      const matchId = "match-id-to-delete";
      const deletedMatch = {
        id: matchId,
        title: "Deleted Match",
        description: "This match has been deleted",
        MatchDate: new Date(),
        teamNameA: "Team A",
        teamAScore: 3,
        teamNameB: "Updatable Team B",
        teamBScore: 2,
        location: "Stadium A",
        sport: "futsal",
        maxPlayers: 22,
        MatchStatus: MatchStatus.FINALIZADO,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.match.delete.mockResolvedValue(deletedMatch);

      // Act
      const result = await matchRepository.deleteMatch(matchId);

      // Assert
      expect(prismaMock.match.delete).toHaveBeenCalledWith({
        where: { id: matchId },
      });
      expect(prismaMock.playerSubscription.deleteMany).toHaveBeenCalledWith({
        where: { matchId: matchId },
      });
      expect(result).toEqual(deletedMatch);
    });

    it("should throw an error if match deletion fails (e.g. not found)", async () => {
      // Arrange
      const matchId = "non-existent-match-id";
      // Simula que o prisma retorna null no delete (o que normalmente lançaria erro, mas para o mock...)
      // Ou melhor, o seu código faz um check `if (!match)`. Mas o prisma.delete lança erro se não achar.
      // Vamos simular que o delete retorna null para testar o seu `if (!match) throw new Error`.
      prismaMock.match.delete.mockResolvedValue(null as any);

      // Act & Assert
      await expect(
        matchRepository.deleteMatch(matchId),
      ).rejects.toThrow("Match not found");
    });
  });

  // ======================================================
  // FIND ALL (Paginação)
  // ======================================================
  describe("findAll", () => {
    it("should return paginated matches and total count", async () => {
      // Arrange
      const limit = 10;
      const offset = 0;
      const mockMatches = [
        { id: "1", title: "Match 1", _count: { players: 5 } },
        { id: "2", title: "Match 2", _count: { players: 2 } },
      ] as any;
      const totalCount = 20;

      // Mock do findMany
      prismaMock.match.findMany.mockResolvedValue(mockMatches);
      // Mock do count
      prismaMock.match.count.mockResolvedValue(totalCount);

      // Act
      const result = await matchRepository.findAll(limit, offset);

      // Assert
      expect(prismaStub.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.match.findMany).toHaveBeenCalledWith({
        take: limit,
        skip: offset,
        orderBy: { MatchDate: "desc" },
        include: { _count: { select: { players: true } } },
      });
      expect(prismaMock.match.count).toHaveBeenCalled();
      
      expect(result).toEqual({
        matches: mockMatches,
        totalCount: totalCount,
      });
    });

    it("should propagate errors from transaction", async () => {
      // Arrange
      // Simulamos que a transação falha
      // Como nosso stub usa Promise.all, se uma promessa falhar, tudo falha.
      prismaMock.match.findMany.mockRejectedValue(new Error("DB Error"));

      // Act & Assert
      await expect(matchRepository.findAll(10, 0)).rejects.toThrow("DB Error");
    });
  });

  // ======================================================
  // FIND BY ID
  // ======================================================
  describe("findById", () => {
    it("should return a match with players included", async () => {
      // Arrange
      const matchId = "uuid-1";
      const mockMatch = {
        id: matchId,
        title: "Details Match",
        players: [
          { userId: "u1", user: { id: "u1", name: "User 1" } }
        ]
      } as any;

      prismaMock.match.findUnique.mockResolvedValue(mockMatch);

      // Act
      const result = await matchRepository.findById(matchId);

      // Assert
      expect(prismaMock.match.findUnique).toHaveBeenCalledWith({
        where: { id: matchId },
        include: {
          players: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  userName: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockMatch);
    });

    it("should return null if match is not found", async () => {
      // Arrange
      prismaMock.match.findUnique.mockResolvedValue(null);

      // Act
      const result = await matchRepository.findById("uuid-none");

      // Assert
      expect(result).toBeNull();
    });
  });

  // ======================================================
  // FIND SUBSCRIPTION
  // ======================================================
  describe("findSubscription", () => {
    it("should return a subscription if found", async () => {
      // Arrange
      const userId = "u1";
      const matchId = "m1";
      const mockSub = { id: "sub1", userId, matchId } as PlayerSubscription;

      prismaMock.playerSubscription.findUnique.mockResolvedValue(mockSub);

      // Act
      const result = await matchRepository.findSubscription(userId, matchId);

      // Assert
      expect(prismaMock.playerSubscription.findUnique).toHaveBeenCalledWith({
        where: {
          userId_matchId: { userId, matchId },
        },
      });
      expect(result).toEqual(mockSub);
    });

    it("should return null if subscription not found", async () => {
      // Arrange
      prismaMock.playerSubscription.findUnique.mockResolvedValue(null);

      // Act
      const result = await matchRepository.findSubscription("u1", "m1");

      // Assert
      expect(result).toBeNull();
    });
  });

  // ======================================================
  // CREATE SUBSCRIPTION
  // ======================================================
  describe("createSubscription", () => {
    it("should create a player subscription", async () => {
      // Arrange
      const userId = "u1";
      const matchId = "m1";
      const team = TeamSide.A;
      const mockSub = { id: "sub1", userId, matchId, team } as PlayerSubscription;

      prismaMock.playerSubscription.create.mockResolvedValue(mockSub);

      // Act
      const result = await matchRepository.createSubscription(userId, matchId, team);

      // Assert
      expect(prismaMock.playerSubscription.create).toHaveBeenCalledWith({
        data: { userId, matchId, team },
      });
      expect(result).toEqual(mockSub);
    });
  });

  // ======================================================
  // UPDATE SUBSCRIPTION TEAM
  // ======================================================
  describe("updateSubscriptionTeam", () => {
    it("should update the team of a subscription", async () => {
      // Arrange
      const subId = "sub1";
      const newTeam = TeamSide.B;
      const mockUpdatedSub = { id: subId, team: newTeam } as PlayerSubscription;

      prismaMock.playerSubscription.update.mockResolvedValue(mockUpdatedSub);

      // Act
      const result = await matchRepository.updateSubscriptionTeam(subId, newTeam);

      // Assert
      expect(prismaMock.playerSubscription.update).toHaveBeenCalledWith({
        where: { id: subId },
        data: { team: newTeam },
      });
      expect(result).toEqual(mockUpdatedSub);
    });
  });

  // ======================================================
  // DELETE SUBSCRIPTION
  // ======================================================
  describe("deleteSubscription", () => {
    it("should delete a subscription", async () => {
      // Arrange
      const subId = "sub1";
      prismaMock.playerSubscription.delete.mockResolvedValue({ id: subId } as any);

      // Act
      await matchRepository.deleteSubscription(subId);

      // Assert
      expect(prismaMock.playerSubscription.delete).toHaveBeenCalledWith({
        where: { id: subId },
      });
    });
  });
});