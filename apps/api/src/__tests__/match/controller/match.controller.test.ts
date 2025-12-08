import { NextFunction, Request, Response } from "express";
import matchController from "../../../modules/match/match.controller";
import HttpStatus from "http-status";
import matchService from "../../../modules/match/match.service";
import { userService } from "../../../modules/user/user.service";
import { User, Match } from "@prisma/client";

// Mock do módulo matchService
jest.mock("../../../modules/match/match.service");
jest.mock("../../../modules/user/user.service");

describe("matchController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
<<<<<<< HEAD
=======
  let nextMock: jest.Mock;
>>>>>>> 8d457396e937d83a6c5216b18d78ca56117d3445

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    statusMock = res.status as jest.Mock;
    jsonMock = res.json as jest.Mock;
<<<<<<< HEAD
  });

  describe("createMatch", () => {
    it("should create a match and return it with status 201", async () => {
      // Arrange
      const mockMatchData = {
        userId: "author-1",
        title: "Match 1",
        description: "Description for Match 1",
        MatchDate: new Date(),
        teamNameA: "Team A",
        teamAScore: 3,
        teamNameB: "Updatable Team B",
        teamBScore: 2,
        location: "Stadium A",
        sport: "futsal",
        maxPlayers: 22,
      };

      const mockAuthor: User = {
        id: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
        name: "Author Name",
        userName: "authorusername",
        email: "author@example.com",
        passwordHash: "hashedpassword",
        profileType: null,
        notificationsAllowed: true,
      };

      const mockCreatedMatch = {
        ...mockMatchData,
        MatchStatus: "EM_BREVE",
        id: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      req = {
        body: mockMatchData,
      };

      (matchService.createMatch as jest.Mock).mockResolvedValue(mockCreatedMatch);
      (userService.getUserById as jest.Mock).mockResolvedValue(mockAuthor);

      // Act
      await matchController.createMatch(req as Request, res as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(matchService.createMatch).toHaveBeenCalledWith({
        ...mockMatchData,
        author: mockAuthor,
      });
      expect(userService.getUserById).toHaveBeenCalledWith("author-1");
      expect(jsonMock).toHaveBeenCalledWith(mockCreatedMatch);
=======
    nextMock = jest.fn();
  });

  it("should create a match and return it with status 201", async () => {
    // Arrange
    const mockMatchData = {
      userId: "author-1",
      title: "Match 1",
      description: "Description for Match 1",
      MatchDate: new Date(),
      teamNameA: "Team A",
      teamNameB: "Team B",
      location: "Stadium A",
      maxPlayers: 22,
    };

    const mockAuthor: User = {
      id: "1",
      createdAt: new Date(),
      updatedAt: new Date(),
      name: "Author Name",
      userName: "authorusername",
      email: "author@example.com",
      passwordHash: "hashedpassword",
      profileType: null,
    };

    const mockCreatedMatch: Match = {
      ...mockMatchData,
      MatchStatus: "EM_BREVE",
      id: "1",
      authorId: mockAuthor.id,
      sport: "Soccer",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    req = {
      body: mockMatchData,
    };

    (matchService.createMatch as jest.Mock).mockResolvedValue(mockCreatedMatch);
    (userService.getUserById as jest.Mock).mockResolvedValue(mockAuthor);

    // Mockar as informações que vão para o middleware de notificação
    res.locals = {
      newMatchId: mockCreatedMatch.id,
      matchTitle: mockCreatedMatch.title,
      matchDate: mockCreatedMatch.MatchDate,
      matchLocation: mockCreatedMatch.location,
      matchSport: (mockCreatedMatch as Match).sport,
      authorName: mockAuthor.name,
    };

    // Act
    await matchController.createMatch(
      req as Request,
      res as Response,
      nextMock as NextFunction,
    );

    // Assert
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.CREATED);
    expect(matchService.createMatch).toHaveBeenCalledWith({
      ...mockMatchData,
      author: mockAuthor,
>>>>>>> 8d457396e937d83a6c5216b18d78ca56117d3445
    });
    expect(userService.getUserById).toHaveBeenCalledWith("author-1");
    expect(jsonMock).toHaveBeenCalledWith(mockCreatedMatch);
  });

<<<<<<< HEAD
    it("should return 401 if user is not authorized when creating a match", async () => {
      // Arrange
      req = {
        body: {},
      };

      // Act
      await matchController.createMatch(req as Request, res as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Não foi possivel autorizar o usuário",
      });
    });

    it("should return 404 if author user is not found when creating a match", async () => {
      // Arrange
      req = {
        body: {
          userId: "nonexistent-user",
        },
      };

      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      // Act
      await matchController.createMatch(req as Request, res as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Usuário autor não encontrado",
      });
    });
  })

  describe("updateMatch", () => {
    it("should update a match and return it with status 200", async () => {
      // Arrange
      const mockMatchId = "match-1";
      const mockAuthUserId = "user-1";
      const mockUpdateData = {
        title: "Updated Match Title",
      };

      const mockUpdatedMatch = {
        id: mockMatchId,
        authorId: mockAuthUserId,
        title: "Updated Match Title",
        description: "Some description",
        MatchDate: new Date(),
        teamNameA: "Team A",
        teamAScore: 3,
        teamNameB: "Updatable Team B",
        teamBScore: 2,
        location: "Stadium A",
        sport: "futsal",
        maxPlayers: 22,
        MatchStatus: "EM_BREVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      req = {
        params: { id: mockMatchId },
        body: mockUpdateData,
        user: { id: mockAuthUserId },
      } as Partial<Request>;

      (matchService.updateMatch as jest.Mock).mockResolvedValue(mockUpdatedMatch);

      // Act
      await matchController.updateMatch(req as Request, res as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
      expect(matchService.updateMatch).toHaveBeenCalledWith(
        mockMatchId,
        mockAuthUserId,
        mockUpdateData,
      );
      expect(jsonMock).toHaveBeenCalledWith(mockUpdatedMatch);
    });

    it("should return 401 if user is not authorized when updating a match", async () => {
      // Arrange
      req = {
        params: { id: "match-1" },
        body: {},
      } as Partial<Request>;

      // Act
      await matchController.updateMatch(req as Request, res as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Não foi possivel autorizar o usuário",
      });
    });

    it("should return 404 if matchId is not provided when updating a match", async () => {
      // Arrange
      req = {
        body: {},
        user: { id: "user-1" },
      } as Partial<Request>;

      // Act
      await matchController.updateMatch(req as Request, res as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Id da partida é obrigatorio para continuar",
      });
    });
  })

  describe("deleteMatch", () => {
    it("should delete a match and return status 204", async () => {
      // Arrange
      const mockMatchId = "match-1";
      const mockAuthUserId = "user-1";

      req = {
        params: { id: mockMatchId },
        user: { id: mockAuthUserId },
      } as Partial<Request>;

      // Act
      await matchController.deleteMatch(req as Request, res as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
      expect(matchService.deleteMatch).toHaveBeenCalledWith(
        mockMatchId,
        mockAuthUserId,
      );
    });

    it("should return 401 if user is not authorized when deleting a match", async () => {
      // Arrange
      req = {
        params: { id: "match-1" },
      } as Partial<Request>;

      // Act
      await matchController.deleteMatch(req as Request, res as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Não foi possivel autorizar o usuário",
      });
    });

    it("should return 404 if matchId is not provided when deleting a match", async () => {
      // Arrange
      req = {
        user: { id: "user-1" },
      } as Partial<Request>;

      // Act
      await matchController.deleteMatch(req as Request, res as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Id da partida é obrigatorio para continuar",
      });
    });
  })

  describe("listMatchesByUserId", () => {
    it("Deve retornar uma lista com todas as partidas que o usuário logado for autor com codigo 200", async () => {
      const matches = [
        {
          userId: "author-id",
          title: "Match 1",
          description: "Description for Match 1",
          MatchDate: new Date(),
          teamNameA: "Team A",
          teamNameB: "Team B",
          location: "Stadium A",
          maxPlayers: 22,
        },
        {
          userId: "author-id",
          title: "Match 2",
          description: "Description for Match 2",
          MatchDate: new Date(),
          teamNameA: "Team A",
          teamNameB: "Team B",
          location: "Stadium A",
          maxPlayers: 22,
        }
      ];

      (req as any).user = { id: "author-id" };
      (matchService.getAllMatchesByUserId as jest.Mock).mockResolvedValue(matches);

      await matchController.listMatchesByUserId(
        req as Request,
        res as Response,
      );

      expect(res.json).toHaveBeenCalledWith(matches);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK)
    })
  })
});
=======
  it("should return 401 if user is not authorized when creating a match", async () => {
    // Arrange
    req = {
      body: {},
    };

    // Act
    await matchController.createMatch(
      req as Request,
      res as Response,
      nextMock as NextFunction,
    );

    // Assert
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Não foi possivel autorizar o usuário",
    });
  });

  it("should return 404 if author user is not found when creating a match", async () => {
    // Arrange
    req = {
      body: {
        userId: "nonexistent-user",
      },
    };

    (userService.getUserById as jest.Mock).mockResolvedValue(null);

    // Act
    await matchController.createMatch(
      req as Request,
      res as Response,
      nextMock as NextFunction,
    );

    // Assert
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Usuário autor não encontrado",
    });
  });

  it("should update a match and return it with status 200", async () => {
    // Arrange
    const mockMatchId = "match-1";
    const mockAuthUserId = "user-1";
    const mockUpdateData = {
      title: "Updated Match Title",
    };

    const mockUpdatedMatch: Match = {
      id: mockMatchId,
      authorId: mockAuthUserId,
      sport: "Soccer",
      title: "Updated Match Title",
      description: "Some description",
      MatchDate: new Date(),
      teamNameA: "Team A",
      teamNameB: "Team B",
      location: "Stadium A",
      maxPlayers: 22,
      MatchStatus: "EM_BREVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    req = {
      params: { id: mockMatchId },
      body: mockUpdateData,
      user: { id: mockAuthUserId },
    } as any;

    (matchService.updateMatch as jest.Mock).mockResolvedValue(mockUpdatedMatch);

    // Act
    await matchController.updateMatch(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
    expect(matchService.updateMatch).toHaveBeenCalledWith(
      mockMatchId,
      mockAuthUserId,
      mockUpdateData,
    );
    expect(jsonMock).toHaveBeenCalledWith(mockUpdatedMatch);
  });

  it("should return 401 if user is not authorized when updating a match", async () => {
    // Arrange
    req = {
      params: { id: "match-1" },
      body: {},
    } as Partial<Request>;

    // Act
    await matchController.updateMatch(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Não foi possivel autorizar o usuário",
    });
  });

  it("should return 404 if matchId is not provided when updating a match", async () => {
    // Arrange
    req = {
      body: {},
      user: { id: "user-1" },
    } as Partial<Request>;

    // Act
    await matchController.updateMatch(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Id da partida é obrigatorio para continuar",
    });
  });

  it("should delete a match and return status 204", async () => {
    // Arrange
    const mockMatchId = "match-1";
    const mockAuthUserId = "user-1";

    req = {
      params: { id: mockMatchId },
      user: { id: mockAuthUserId },
    } as any;

    // Act
    await matchController.deleteMatch(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
    expect(matchService.deleteMatch).toHaveBeenCalledWith(
      mockMatchId,
      mockAuthUserId,
    );
  });

  it("should return 401 if user is not authorized when deleting a match", async () => {
    // Arrange
    req = {
      params: { id: "match-1" },
    } as Partial<Request>;

    // Act
    await matchController.deleteMatch(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Não foi possivel autorizar o usuário",
    });
  });

  it("should return 404 if matchId is not provided when deleting a match", async () => {
    // Arrange
    req = {
      user: { id: "user-1" },
    } as Partial<Request>;

    // Act
    await matchController.deleteMatch(req as Request, res as Response);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Id da partida é obrigatorio para continuar",
    });
  });
});
>>>>>>> 8d457396e937d83a6c5216b18d78ca56117d3445
