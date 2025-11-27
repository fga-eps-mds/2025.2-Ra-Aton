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

    // Sanity checks before invoking the repository to ensure our stubs point
    // to the same mock functions we configured.
    expect(prismaStub.match.create).toBe(prismaMock.match.create);
    expect(prismaStub.playerSubscription.create).toBe(
      prismaMock.playerSubscription.create,
    );

    // Act
    const result = await matchRepository.createMatch(matchData, author);

    // Quick sanity checks to help debug when things go wrong
    expect(prismaStub.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.match.create).toHaveBeenCalledTimes(1);

    // Assert final result
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
      expect(prismaMock.match.create).toHaveBeenCalledTimes(1);
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
      };

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
      const matchData = {
          title: "Updatable Match",
          description: "Updatable description",
          MatchDate: new Date(),
          teamNameA: "Updatable Team A",
          teamNameB: "Updatable Team B",
          location: "Updatable Stadium",
          maxPlayers: 22,
      };

      prismaMock.match.update.mockRejectedValue(new Error("Database error") as any);

      // Act & Assert
      await expect(
        matchRepository.updateMatch(matchId, matchData),
      ).rejects.toThrow("Database error");

      expect(prismaMock.match.update).toHaveBeenCalledWith({
        where: { id: matchId },
        data: matchData,
      });
    });
  });

  describe("Delete Match", () => {
    it("should delete an existing match", async () => {
      // Arrange
      const matchId = "match-id-to-delete";

      const deletedMatch = {
        id: matchId,
        authorId: "author-id",
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

    it("should throw an error if match deletion fails", async () => {
      // Arrange
      const matchId = "non-existent-match-id";

      prismaMock.match.delete.mockRejectedValue(new Error("Database error") as any);

      // Act & Assert
      await expect(
        matchRepository.deleteMatch(matchId),
      ).rejects.toThrow("Database error");

      expect(prismaMock.match.delete).toHaveBeenCalledWith({
        where: { id: matchId },
      });
    });
  });
});