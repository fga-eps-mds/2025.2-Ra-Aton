import { NextFunction, Request, Response } from "express";
import matchController from "../../../modules/match/match.controller";
import HttpStatus from "http-status";
import matchService from "../../../modules/match/match.service";
import { userService } from "../../../modules/user/user.service";
import { User, Match } from "@prisma/client";
import { ApiError } from "../../../utils/ApiError";

// Mock do módulo matchService
jest.mock("../../../modules/match/match.service");
jest.mock("../../../modules/user/user.service");

describe("matchController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let nextMock: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    statusMock = res.status as jest.Mock;
    jsonMock = res.json as jest.Mock;
    nextMock = jest.fn();
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
        notificationsAllowed: true
      };

      const mockCreatedMatch: Match = {
        ...mockMatchData,
        MatchStatus: "EM_BREVE",
        id: "1",
        authorId: mockAuthor.id,
        sport: "Soccer",
        createdAt: new Date(),
        updatedAt: new Date(),
        teamAScore: 0,
        teamBScore: 0,
        reminderSent: false
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
      });
      expect(userService.getUserById).toHaveBeenCalledWith("author-1");
      expect(jsonMock).toHaveBeenCalledWith(mockCreatedMatch);
    });

    it("should return 401 if user is not authorized when creating a match", async () => {
      // Arrange
      req = {
        body: {},
      };

      // Act
      await matchController.createMatch(req as Request, res as Response, nextMock);

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
      await matchController.createMatch(req as Request, res as Response, nextMock);

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
      } as unknown as Partial<Request>;

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

    it("should return 401 if user.id is missing when updating a match", async () => {
      // Arrange
      req = {
        params: { id: "match-1" },
        body: {},
        user: {},
      } as any;

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

    it("should return 404 if matchId is empty string", async () => {
      // Arrange
      req = {
        params: { id: "" },
        body: {},
        user: { id: "user-1" },
      } as any;

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
      } as unknown as Partial<Request>;

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

    it("should return 401 if user.id is missing when deleting a match", async () => {
      // Arrange
      req = {
        params: { id: "match-1" },
        user: {},
      } as any;

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

    it("should return 404 if matchId is empty string when deleting", async () => {
      // Arrange
      req = {
        params: { id: "" },
        user: { id: "user-1" },
      } as any;

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

    it("should return 401 if user is not authenticated", async () => {
      req = {
        user: undefined,
      } as any;

      await matchController.listMatchesByUserId(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Usuário não está logado corretamente",
      });
    });

    it("should return 401 if user.id is missing", async () => {
      req = {
        user: {},
      } as any;

      await matchController.listMatchesByUserId(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Usuário não está logado corretamente",
      });
    });
  })

  describe("listMatches", () => {
    it("should return matches with default pagination", async () => {
      const mockMatches = {
        data: [{ id: "match-1", title: "Match 1" }],
        total: 1,
        page: 1,
        limit: 10,
      };

      req = {
        query: {},
      } as any;

      (matchService.getAllMatches as jest.Mock).mockResolvedValue(mockMatches);

      await matchController.listMatches(req as Request, res as Response);

      expect(matchService.getAllMatches).toHaveBeenCalledWith(10, 1);
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
      expect(jsonMock).toHaveBeenCalledWith(mockMatches);
    });

    it("should return matches with custom pagination", async () => {
      const mockMatches = {
        data: [{ id: "match-1", title: "Match 1" }],
        total: 1,
        page: 2,
        limit: 20,
      };

      req = {
        query: { limit: "20", page: "2" },
      } as any;

      (matchService.getAllMatches as jest.Mock).mockResolvedValue(mockMatches);

      await matchController.listMatches(req as Request, res as Response);

      expect(matchService.getAllMatches).toHaveBeenCalledWith(20, 2);
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
      expect(jsonMock).toHaveBeenCalledWith(mockMatches);
    });

    it("should throw error if limit exceeds 50", async () => {
      req = {
        query: { limit: "51" },
      } as any;

      await expect(
        matchController.listMatches(req as Request, res as Response)
      ).rejects.toThrow(ApiError);
    });

    it("should use default values for invalid pagination parameters", async () => {
      const mockMatches = {
        data: [{ id: "match-1", title: "Match 1" }],
        total: 1,
        page: 1,
        limit: 10,
      };

      req = {
        query: { limit: "invalid", page: "invalid" },
      } as any;

      (matchService.getAllMatches as jest.Mock).mockResolvedValue(mockMatches);

      await matchController.listMatches(req as Request, res as Response);

      expect(matchService.getAllMatches).toHaveBeenCalledWith(10, 1);
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
      expect(jsonMock).toHaveBeenCalledWith(mockMatches);
    });
  });

  describe("getMatch", () => {
    it("should return a match by id", async () => {
      const mockMatch = {
        id: "match-1",
        title: "Match 1",
        authorId: "user-1",
      };

      req = {
        params: { id: "match-1" },
      } as any;

      (matchService.getMatchById as jest.Mock).mockResolvedValue(mockMatch);

      await matchController.getMatch(req as Request, res as Response);

      expect(matchService.getMatchById).toHaveBeenCalledWith("match-1");
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
      expect(jsonMock).toHaveBeenCalledWith(mockMatch);
    });
  });

  describe("subscribeToMatch", () => {
    it("should subscribe user to match successfully", async () => {
      req = {
        params: { id: "match-1" },
        user: { id: "user-1" },
      } as any;

      (matchService.subscribeToMatch as jest.Mock).mockResolvedValue(undefined);

      await matchController.subscribeToMatch(req as Request, res as Response);

      expect(matchService.subscribeToMatch).toHaveBeenCalledWith("match-1", "user-1");
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Inscrição realizada com sucesso",
      });
    });
  });

  describe("unsubscribeFromMatch", () => {
    it("should unsubscribe user from match successfully", async () => {
      req = {
        params: { id: "match-1" },
        user: { id: "user-1" },
      } as any;

      (matchService.unsubscribeFromMatch as jest.Mock).mockResolvedValue(undefined);

      await matchController.unsubscribeFromMatch(req as Request, res as Response);

      expect(matchService.unsubscribeFromMatch).toHaveBeenCalledWith("match-1", "user-1");
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Inscrição cancelada com sucesso",
      });
    });
  });

  describe("switchTeam", () => {
    it("should switch user team successfully", async () => {
      req = {
        params: { id: "match-1" },
        user: { id: "user-1" },
      } as any;

      (matchService.switchTeam as jest.Mock).mockResolvedValue(undefined);

      await matchController.switchTeam(req as Request, res as Response);

      expect(matchService.switchTeam).toHaveBeenCalledWith("match-1", "user-1");
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Troca de time realizada com sucesso",
      });
    });
  });

  describe("updateMatch - error handling", () => {
    it("should handle ApiError thrown by service", async () => {
      const mockMatchId = "match-1";
      const mockAuthUserId = "user-1";

      req = {
        params: { id: mockMatchId },
        body: { title: "Updated Title" },
        user: { id: mockAuthUserId },
      } as any;

      const apiError = new ApiError(HttpStatus.FORBIDDEN, "Sem permissão");
      (matchService.updateMatch as jest.Mock).mockRejectedValue(apiError);

      await matchController.updateMatch(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Sem permissão" });
    });

    it("should handle generic error thrown by service", async () => {
      const mockMatchId = "match-1";
      const mockAuthUserId = "user-1";

      req = {
        params: { id: mockMatchId },
        body: { title: "Updated Title" },
        user: { id: mockAuthUserId },
      } as any;

      (matchService.updateMatch as jest.Mock).mockRejectedValue(new Error("Generic error"));

      await matchController.updateMatch(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Erro ao atualizar partida" });
    });
  });

  describe("deleteMatch - error handling", () => {
    it("should handle ApiError thrown by service", async () => {
      const mockMatchId = "match-1";
      const mockAuthUserId = "user-1";

      req = {
        params: { id: mockMatchId },
        user: { id: mockAuthUserId },
      } as any;

      const apiError = new ApiError(HttpStatus.FORBIDDEN, "Sem permissão");
      (matchService.deleteMatch as jest.Mock).mockRejectedValue(apiError);

      await matchController.deleteMatch(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Sem permissão" });
    });

    it("should handle generic error thrown by service", async () => {
      const mockMatchId = "match-1";
      const mockAuthUserId = "user-1";

      req = {
        params: { id: mockMatchId },
        user: { id: mockAuthUserId },
      } as any;

      (matchService.deleteMatch as jest.Mock).mockRejectedValue(new Error("Generic error"));

      await matchController.deleteMatch(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Erro ao deletar partida" });
    });
  });

  describe("createMatch - error cases", () => {
    it("should return 500 if matchService.createMatch returns null", async () => {
      const mockMatchData = {
        userId: "author-1",
        title: "Match 1",
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
        notificationsAllowed: true,
        bio: null,
        profileImageUrl: null,
        bannerImageUrl: null,
        profileImageId: null,
        bannerImageId: null,
      };

      req = {
        body: mockMatchData,
      };

      (userService.getUserById as jest.Mock).mockResolvedValue(mockAuthor);
      (matchService.createMatch as jest.Mock).mockResolvedValue(null);

      await matchController.createMatch(
        req as Request,
        res as Response,
        nextMock as NextFunction
      );

      expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Erro ao criar partida." });
    });
  });
});
