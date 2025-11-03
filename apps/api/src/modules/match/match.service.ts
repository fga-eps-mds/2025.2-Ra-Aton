import matchRepository from "./match.repository";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import { Match, PlayerSubscription, TeamSide } from "@prisma/client";
import { MatchWithPlayers } from "./match.repository"; // O tipo que já criamos

/*
Vou comentar esse arquivo inteiro para explicar as mudanças feitas para implementar a lógica de times e o balanceamento Round Robin.
*/

/**
 * Função auxiliar para formatar a resposta de detalhe de partida.
 * inclui a divisão em times A e B, com detalhes de vagas.
 */
const formatMatchDetailResponse = (match: MatchWithPlayers) => {
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
  const filledSpots = match._count.players;
  const openSpots = match.maxPlayers - filledSpots;
  const isSubscriptionOpen = openSpots > 0;

  const { _count, ...restOfMatch } = match;

  return {
    ...restOfMatch,
    spots: {
      filled: filledSpots,
      open: openSpots,
    },
    isSubscriptionOpen: isSubscriptionOpen,
  };
};

class MatchService {
  /**
   * Busca todas as partidas.
   * Usa o formatador de lista simples.
   */
  async getAllMatches() {
    const matches = await matchRepository.findAll();
    return matches.map(formatMatchListResponse);
  }

  /**
   * Busca uma partida específica pelo ID.
   * Usa o formatador de detalhe com times.
   */
  async getMatchById(matchId: string) {
    const match = await matchRepository.findById(matchId);
    if (!match) {
      throw new ApiError(httpStatus.NOT_FOUND, "Partida não encontrada");
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
      throw new ApiError(httpStatus.NOT_FOUND, "Partida não encontrada");
    }

    // Checa se o usuário já está inscrito
    const isAlreadySubscribed = match.players.some((p) => p.userId === userId);
    if (isAlreadySubscribed) {
      throw new ApiError(
        httpStatus.CONFLICT,
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
          httpStatus.FORBIDDEN,
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
          httpStatus.FORBIDDEN,
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
        httpStatus.NOT_FOUND,
        "Você não está inscrito nesta partida",
      );
    }

    //  Determinar o time atual e o novo time
    const currentTeam = subscription.team;
    const newTeam = currentTeam === "A" ? "B" : "A";

    //  Checar se o NOVO time está cheio
    const match = await matchRepository.findById(matchId);
    if (!match)
      throw new ApiError(httpStatus.NOT_FOUND, "Partida não encontrada");

    const teamMaxSize = Math.floor(match.maxPlayers / 2);
    const countNewTeam = match.players.filter((p) => p.team === newTeam).length;

    if (countNewTeam >= teamMaxSize) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
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
        httpStatus.NOT_FOUND,
        "Você não está inscrito nesta partida",
      );
    }
    await matchRepository.deleteSubscription(existingSubscription.id);
  }
}

export default new MatchService();
