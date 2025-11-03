import matchRepository from "./match.repository";
import { ApiError } from "../../utils/ApiError";
import HttpStatus from "http-status";
import { Match } from "@prisma/client";
import is from "zod/v4/locales/is.js";

const formatMatchResponse = (
  match: Match & { _count?: { players: number }; players?: any[] },
) => {
  let filledSpots: number;
  if (match._count) {
    filledSpots = match._count.players;
  } else if (match.players) {
    filledSpots = match.players.length;
  } else {
    filledSpots = 0;
  }

  const openSpots = match.maxPlayers - filledSpots;
  const isSubscriptionOpen = openSpots > 0;

  const { _count, players, ...restOfMatch } = match;

  return {
    ...restOfMatch,
    spots: {
      filled: filledSpots,
      open: openSpots,
    },
    isSubscriptionOpen: isSubscriptionOpen,
    players: players ?? [],
  };
};

class MatchService {
  async getAllMatches() {
    const matches = await matchRepository.findAll();
    return matches.map(formatMatchResponse);
  }

  async getMatchById(matchId: string) {
    const match = await matchRepository.findById(matchId);
    if (!match) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Partida não encontrada");
    }

    return formatMatchResponse(match);
  }

  async subscribeToMatch(matchId: string, userId: string) {
    const match = await matchRepository.findById(matchId);
    if (!match) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Partida não encontrada");
    }

    const existingSubscription = await matchRepository.findSubscription(
      userId,
      matchId,
    );
    if (existingSubscription) {
      throw new ApiError(
        HttpStatus.CONFLICT,
        "Você já está inscrito nesta partida",
      );
    }

    const filledSpots = match.players.length;
    if (filledSpots >= match.maxPlayers) {
      throw new ApiError(
        HttpStatus.FORBIDDEN,
        "Não há vagas disponíveis nesta partida",
      );
    }

    await matchRepository.createSubscription(userId, matchId);
  }

  async unsubscribeFromMatch(matchId: string, userId: string) {
    const existingSubscription = await matchRepository.findSubscription(
      userId,
      matchId,
    );
    if (!existingSubscription) {
      throw new ApiError(
        HttpStatus.NOT_FOUND,
        "Você não está inscrito nesta partida",
      );
    }

    await matchRepository.deleteSubscription(existingSubscription.id);
  }
}

export default new MatchService();
