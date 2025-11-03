import {
  Match,
  MatchStatus,
  PlayerSubscription,
  TeamSide,
} from "@prisma/client";
import { ApiError } from "../../utils/ApiError";
import { MatchWithPlayers } from "./match.repository"; // O tipo que já criamos
import HttpStatus from "http-status";
import matchRepository from "./match.repository";

/**
 * Calcula o status dinâmico da partida com base na data atual.
 * @param matchDate Data da partida.
 * @param databaseStatus o status salvo no banco de dados.
 */
const getComputedMatchStatus = (
  matchDate: Date,
  databaseStatus: MatchStatus,
) => {
  const now = new Date();

  if (databaseStatus === "FINALIZADO") {
    return "FINALIZADO";
  }

  if (now >= matchDate) {
    return "EM_ANDAMENTO";
  }

  return databaseStatus; // EM_BREVE
};

/**
 * Função auxiliar para formatar a resposta de detalhe de partida.
 * inclui a divisão em times A e B, com detalhes de vagas.
 */
const formatMatchDetailResponse = (match: MatchWithPlayers) => {
  const computedStatus = getComputedMatchStatus(
    match.MatchDate,
    match.MatchStatus,
  );
  // Calcula o tamanho máximo de cada time
  const teamMaxSize = Math.floor(match.maxPlayers / 2);

  // Divide os jogadores inscritos em times
  const playersA = match.players.filter((p) => p.team === "A");
  const playersB = match.players.filter((p) => p.team === "B");

  const spotsA_Filled = playersA.length;
  const spotsB_Filled = playersB.length;

  const teamA_isOpen = spotsA_Filled < teamMaxSize;
  const teamB_isOpen = spotsB_Filled < teamMaxSize;

  const { players, ...restOfMatch } = match; // Remove a lista 'players' antiga

  return {
    ...restOfMatch,
    MatchStatus: computedStatus,
    isSubscriptionOpen: teamA_isOpen || teamB_isOpen,
    spots: {
      totalMax: match.maxPlayers,
      totalFilled: playersA.length + playersB.length,
    },
    teamA: {
      name: match.teamNameA,
      max: teamMaxSize,
      filled: spotsA_Filled,
      isOpen: spotsA_Filled < teamMaxSize,
      players: playersA.map((p) => p.user), // Retorna só os dados do usuário
    },
    teamB: {
      name: match.teamNameB,
      max: teamMaxSize,
      filled: spotsB_Filled,
      isOpen: spotsB_Filled < teamMaxSize,
      players: playersB.map((p) => p.user), // Retorna só os dados do usuário
    },
  };
};

/**
 * Função auxiliar para formatar a resposta da LISTA de partidas.
 */
const formatMatchListResponse = (
  match: Match & { _count: { players: number } },
) => {
  const computedStatus = getComputedMatchStatus(
    match.MatchDate,
    match.MatchStatus,
  );
  const filledSpots = match._count.players;
  const openSpots = match.maxPlayers - filledSpots;
  const isSubscriptionOpen = openSpots > 0;

  const { _count, ...restOfMatch } = match;

  return {
    ...restOfMatch,
    MatchStatus: computedStatus,
    isSubscriptionOpen: isSubscriptionOpen,
    spots: {
      filled: filledSpots,
      open: openSpots,
    },
  };
};

class matchService {
  createMatch = async (data: any): Promise<Match> => {
    if (!data.author || !data.author.id) {
      throw new ApiError(
        HttpStatus.NOT_FOUND,
        "Autor da partida não encontrado",
      );
    }

    const newMatch = await matchRepository.createMatch(data, data.author);
    return newMatch;
  };

  updateMatch = async (
    matchId: string,
    authUserId: string,
    data: any,
  ): Promise<Match> => {
    const matchFound = await matchRepository.findById(matchId);
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
  };

  deleteMatch = async (matchId: string, authUserId: string): Promise<void> => {
    const matchFound = await matchRepository.findById(matchId);
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
  };

  /**
   * Busca todas as partidas.
   * Usa o formatador de lista simples.
   */
  async getAllMatches(limit: number, page: number) {
    const offset = (page - 1) * limit;

    const { matches, totalCount } = await matchRepository.findAll(
      limit,
      offset,
    );

    const formattedMatches = matches.map(formatMatchListResponse);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: formattedMatches,
      meta: {
        page: page,
        limit: limit,
        totalCount: totalCount,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Busca uma partida específica pelo ID.
   * Usa o formatador de detalhe com times.
   */
  async getMatchById(matchId: string) {
    const match = await matchRepository.findById(matchId);
    if (!match) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Partida não encontrada");
    }
    return formatMatchDetailResponse(match);
  }

  /**
   * Inscreve um usuário (Lógica Round Robin)
   */
  async subscribeToMatch(matchId: string, userId: string) {
    // Pega a partida e todos os jogadores inscritos
    const match = await matchRepository.findById(matchId);
    if (!match) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Partida não encontrada");
    }

    // Checa se o usuário já está inscrito
    const isAlreadySubscribed = match.players.some((p) => p.userId === userId);
    if (isAlreadySubscribed) {
      throw new ApiError(
        HttpStatus.CONFLICT,
        "Você já está inscrito nesta partida",
      );
    }

    // Calcula o tamanho dos times
    const teamMaxSize = Math.floor(match.maxPlayers / 2);
    const countA = match.players.filter((p) => p.team === "A").length;
    const countB = match.players.filter((p) => p.team === "B").length;

    let targetTeam: TeamSide;

    // Lógica Round Robin
    if (countA <= countB) {
      // Tenta alocar no Time A
      if (countA < teamMaxSize) {
        targetTeam = "A";
      } else if (countB < teamMaxSize) {
        // Se Time A cheio, tenta Time B
        targetTeam = "B";
      } else {
        throw new ApiError(
          HttpStatus.FORBIDDEN,
          "Partida cheia. Não há vagas em nenhum time.",
        );
      }
    } else {
      // Tenta alocar no Time B
      if (countB < teamMaxSize) {
        targetTeam = "B";
      } else if (countA < teamMaxSize) {
        // Se Time B cheio, tenta Time A
        targetTeam = "A";
      } else {
        throw new ApiError(
          HttpStatus.FORBIDDEN,
          "Partida cheia. Não há vagas em nenhum time.",
        );
      }
    }

    // Cria a inscrição no time alocado
    await matchRepository.createSubscription(userId, matchId, targetTeam);
  }

  /**
   * Lógica para trocar de time
   */
  async switchTeam(matchId: string, userId: string) {
    // Achar a inscrição do usuário
    const subscription = await matchRepository.findSubscription(
      userId,
      matchId,
    );
    if (!subscription) {
      throw new ApiError(
        HttpStatus.NOT_FOUND,
        "Você não está inscrito nesta partida",
      );
    }

    //  Determinar o time atual e o novo time
    const currentTeam = subscription.team;
    const newTeam = currentTeam === "A" ? "B" : "A";

    //  Checar se o NOVO time está cheio
    const match = await matchRepository.findById(matchId);
    if (!match)
      throw new ApiError(HttpStatus.NOT_FOUND, "Partida não encontrada");

    const teamMaxSize = Math.floor(match.maxPlayers / 2);
    const countNewTeam = match.players.filter((p) => p.team === newTeam).length;

    if (countNewTeam >= teamMaxSize) {
      throw new ApiError(
        HttpStatus.FORBIDDEN,
        `O Time ${newTeam} está cheio. Não é possível trocar.`,
      );
    }

    await matchRepository.updateSubscriptionTeam(subscription.id, newTeam);
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

export default new matchService();
