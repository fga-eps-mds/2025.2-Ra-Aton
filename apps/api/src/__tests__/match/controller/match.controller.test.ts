import { Request, Response } from "express";
import matchController from "../../../modules/match/match.controller";
import { ApiError } from "../../../utils/ApiError";
import HttpStatus from "http-status";
import matchService from "../../../modules/match/match.service";
import { userService } from "../../../modules/user/user.service";
import { User } from "@prisma/client";

// Mock dos serviços
jest.mock("../../../modules/match/match.service");
jest.mock("../../../modules/user/user.service");

describe("matchController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
<<<<<<< HEAD
  let sendMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
=======

  beforeEach(() => {
>>>>>>> 3c446bfca2fb551914ed23b8073301598851ab1c
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
<<<<<<< HEAD
      send: jest.fn().mockReturnThis(),
    };
    statusMock = res.status as jest.Mock;
    jsonMock = res.json as jest.Mock;
    sendMock = res.send as jest.Mock;
  });

  // ======================================================
  // CREATE MATCH
  // ======================================================
  describe("createMatch", () => {
    const mockMatchData = {
      userId: "author-1",
      title: "Match 1",
    };
    const mockAuthor = { id: "1" } as User;

    it("should create a match and return it with status 201", async () => {
      const mockCreatedMatch = { id: "1", ...mockMatchData };
      
      req = { body: mockMatchData };
      
      (userService.getUserById as jest.Mock).mockResolvedValue(mockAuthor);
      (matchService.createMatch as jest.Mock).mockResolvedValue(mockCreatedMatch);

      await matchController.createMatch(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(jsonMock).toHaveBeenCalledWith(mockCreatedMatch);
=======
    };
    statusMock = res.status as jest.Mock;
    jsonMock = res.json as jest.Mock;
  });

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
  });

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
>>>>>>> 3c446bfca2fb551914ed23b8073301598851ab1c
    });
  });

<<<<<<< HEAD
    it("should return 401 if user is not authorized (missing userId in body)", async () => {
      req = { body: {} }; // Sem userId
      await matchController.createMatch(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
=======
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
>>>>>>> 3c446bfca2fb551914ed23b8073301598851ab1c
    });
  });

<<<<<<< HEAD
    it("should return 404 if author is not found", async () => {
      req = { body: { userId: "unknown" } };
      (userService.getUserById as jest.Mock).mockResolvedValue(null);
      
      await matchController.createMatch(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
=======
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
>>>>>>> 3c446bfca2fb551914ed23b8073301598851ab1c
    });
  });

<<<<<<< HEAD
    // COBERTURA: Linha 28 (if (!newMatch))
    it("should return 500 if service returns null (failed creation)", async () => {
      req = { body: mockMatchData };
      (userService.getUserById as jest.Mock).mockResolvedValue(mockAuthor);
      // Força o serviço a retornar null
      (matchService.createMatch as jest.Mock).mockResolvedValue(null);

      await matchController.createMatch(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Erro ao criar partida." });
    });
  });

  // ======================================================
  // UPDATE MATCH
  // ======================================================
  describe("updateMatch", () => {
    const mockMatchId = "match-1";
    const mockAuthUserId = "user-1";

    it("should update a match and return 200", async () => {
      req = {
        params: { id: mockMatchId },
        body: { title: "Updated" },
        user: { id: mockAuthUserId },
      } as any;

      (matchService.updateMatch as jest.Mock).mockResolvedValue({ id: mockMatchId });

      await matchController.updateMatch(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it("should return 401 if not authorized", async () => {
      req = { params: { id: "1" }, body: {} } as any; // Sem user
      await matchController.updateMatch(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    });

    it("should return 404 if req.params is missing", async () => {
       req = { body: {}, user: { id: "1" } } as any; // Sem params
       await matchController.updateMatch(req as Request, res as Response);
       expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    // COBERTURA: Linha 58 (if (!matchId))
    it("should return 404 if matchId is empty string", async () => {
        req = { body: {}, user: { id: "1" }, params: { id: "" } } as any;
        await matchController.updateMatch(req as Request, res as Response);
        expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    // COBERTURA: Linha 65 (if (error instanceof ApiError))
    it("should return specific status if service throws ApiError", async () => {
      req = {
        params: { id: mockMatchId },
        body: {},
        user: { id: mockAuthUserId },
      } as any;

      const apiError = new ApiError(HttpStatus.FORBIDDEN, "Not allowed");
      // Importante: mockRejectedValue lança o erro
      (matchService.updateMatch as jest.Mock).mockRejectedValue(apiError);

      await matchController.updateMatch(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Not allowed" });
    });

    // COBERTURA: Linha 68 (Catch genérico)
    it("should return 500 if service throws generic error", async () => {
      req = {
        params: { id: mockMatchId },
        body: {},
        user: { id: mockAuthUserId },
      } as any;

      (matchService.updateMatch as jest.Mock).mockRejectedValue(new Error("DB Error"));

      await matchController.updateMatch(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Erro ao atualizar partida" });
    });
  });

  // ======================================================
  // DELETE MATCH
  // ======================================================
  describe("deleteMatch", () => {
    const mockMatchId = "match-1";
    const mockAuthUserId = "user-1";

    it("should delete a match and return 204", async () => {
      req = {
        params: { id: mockMatchId },
        user: { id: mockAuthUserId },
      } as any;

      (matchService.deleteMatch as jest.Mock).mockResolvedValue(undefined);

      await matchController.deleteMatch(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
    });

    it("should return 401 if not authorized", async () => {
      req = { params: { id: "1" } } as any;
      await matchController.deleteMatch(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    });

    it("should return 404 if req.params is missing", async () => {
      req = { user: { id: "1" } } as any;
      await matchController.deleteMatch(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    // COBERTURA: Linha 89 (if (!matchId))
    it("should return 404 if matchId is empty string", async () => {
        req = { user: { id: "1" }, params: { id: "" } } as any;
        await matchController.deleteMatch(req as Request, res as Response);
        expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    // COBERTURA: Linha 94 (if (error instanceof ApiError))
    it("should return specific status if service throws ApiError", async () => {
      req = {
        params: { id: mockMatchId },
        user: { id: mockAuthUserId },
      } as any;

      const apiError = new ApiError(HttpStatus.NOT_FOUND, "Match not found");
      (matchService.deleteMatch as jest.Mock).mockRejectedValue(apiError);

      await matchController.deleteMatch(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Match not found" });
    });

    // COBERTURA: Linha 97 (Catch genérico)
    it("should return 500 if service throws generic error", async () => {
      req = {
        params: { id: mockMatchId },
        user: { id: mockAuthUserId },
      } as any;

      (matchService.deleteMatch as jest.Mock).mockRejectedValue(new Error("Unexpected"));

      await matchController.deleteMatch(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Erro ao deletar partida" });
    });
  });

  // ======================================================
  // LIST MATCHES (Paginação)
  // ======================================================
  describe("listMatches", () => {
    it("should return paginated matches with status 200", async () => {
      req = {
        query: { limit: "10", page: "1" },
      } as any;

      const mockResult = { data: [], meta: {} };
      (matchService.getAllMatches as jest.Mock).mockResolvedValue(mockResult);

      await matchController.listMatches(req as Request, res as Response);

      expect(matchService.getAllMatches).toHaveBeenCalledWith(10, 1);
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
      expect(jsonMock).toHaveBeenCalledWith(mockResult);
    });

    it("should use defaults if query params are missing/invalid", async () => {
      req = {
        query: {}, // Vazio
      } as any;

      const mockResult = { data: [], meta: {} };
      (matchService.getAllMatches as jest.Mock).mockResolvedValue(mockResult);

      await matchController.listMatches(req as Request, res as Response);

      // Defaults: limit=10, page=1
      expect(matchService.getAllMatches).toHaveBeenCalledWith(10, 1);
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
    });

    // COBERTURA: Linha 120 (if (safeLimit > 50))
    it("should throw BAD_REQUEST if limit > 50", async () => {
      req = {
        query: { limit: "51" },
      } as any;

      await expect(matchController.listMatches(req as Request, res as Response))
        .rejects.toThrow(ApiError);
        
      // Como o controller lança erro e não tem try/catch (usa catchAsync), 
      // verificamos se a promise rejeita.
    });
  });

  // ======================================================
  // OUTROS MÉTODOS (getMatch, subscribe, unsubscribe, switch)
  // ======================================================
  // Testes básicos para garantir que chamam o serviço correto

  describe("getMatch", () => {
    it("should return a match by ID", async () => {
      req = { params: { id: "1" } } as any;
      const mockMatch = { id: "1" };
      (matchService.getMatchById as jest.Mock).mockResolvedValue(mockMatch);

      await matchController.getMatch(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
      expect(jsonMock).toHaveBeenCalledWith(mockMatch);
    });
  });

  describe("subscribeToMatch", () => {
    it("should subscribe user and return 201", async () => {
      req = { params: { id: "m1" }, user: { id: "u1" } } as any;
      await matchController.subscribeToMatch(req as Request, res as Response);
      
      expect(matchService.subscribeToMatch).toHaveBeenCalledWith("m1", "u1");
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.CREATED);
    });
  });

  describe("unsubscribeFromMatch", () => {
    it("should unsubscribe user and return 200", async () => {
      req = { params: { id: "m1" }, user: { id: "u1" } } as any;
      await matchController.unsubscribeFromMatch(req as Request, res as Response);
      
      expect(matchService.unsubscribeFromMatch).toHaveBeenCalledWith("m1", "u1");
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
    });
  });

  describe("switchTeam", () => {
    it("should switch team and return 200", async () => {
      req = { params: { id: "m1" }, user: { id: "u1" } } as any;
      await matchController.switchTeam(req as Request, res as Response);
      
      expect(matchService.switchTeam).toHaveBeenCalledWith("m1", "u1");
      expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
    });
  });

=======
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
>>>>>>> 3c446bfca2fb551914ed23b8073301598851ab1c
});