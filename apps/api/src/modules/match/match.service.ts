import { Match } from "@prisma/client";
import { ApiError } from "../../utils/ApiError";
import HttpStatus from "http-status";
import matchRepository from "./match.repository";
import { group } from "console";

export const matchService = {
  listAllMatchs: async (): Promise<Match[]> => {
    const matchs = await matchRepository.findAllMatchs();
    return matchs.map((match: Match) => {
      return match;
    });
  },

  getMatchById: async (id: string): Promise<Match> => {
    const match = await matchRepository.findMatchById(id);
    if (!match) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Partida não encontrada");
    }
    return match;
  },

  createMatch: async (data: any): Promise<Match> => {
    if (!data.author || !data.author.id) {
      throw new ApiError(
        HttpStatus.NOT_FOUND,
        "Autor da partida não encontrado",
      );
    }

    const newMatch = await matchRepository.createMatch(data, data.author);
    return newMatch;
  },

  updateMatch: async (
    matchId: string,
    authUserId: string,
    data: any,
  ): Promise<Match> => {
    const matchFound = await matchRepository.findMatchById(matchId);
    if (!matchFound) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Partida não encontrada");
    }

    if (matchFound.authorId !== authUserId) {
      throw new ApiError(
        HttpStatus.FORBIDDEN,
        "Usuário não possui permisão para editar partida",
      );
    }

    const updatedMatch = await matchRepository.updateMatch(matchFound.id, data);
    return updatedMatch;
  },

  deleteMatch: async (matchId: string, authUserId: string): Promise<void> => {
    const matchFound = await matchRepository.findMatchById(matchId);
    if (!matchFound) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Partida não encontrada");
    }

    if (matchFound.authorId !== authUserId) {
      throw new ApiError(
        HttpStatus.FORBIDDEN,
        "Usuário não possui permisão para excluir partida",
      );
    }

    await matchRepository.deleteMatch(matchFound.id);
  },
};
