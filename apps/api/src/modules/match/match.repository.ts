import { prisma } from "../../database/prisma.client";
import { Prisma, Match, PlayerSubscription, TeamSide } from "@prisma/client";

export type MatchWithPlayers = Prisma.MatchGetPayload<{
  include: {
    players: {
      include: {
        user: {
          select: {
            id: true;
            name: true;
            userName: true;
          };
        };
      };
    };
  };
}>;

type MatchWithCount = Match & { _count: { players: number } };
export type FindAllMatchesResponse = {
  matches: MatchWithCount[];
  totalCount: number;
};

class MatchRepository {
  /**
   * Busca todas as partidas com paginação baseada em cursor.
   * @param limit - quantos itens deseja buscar
   * @param cursor - o ID (UUID) do último item visto (para começar depois dele)
   */
  async findAll(
    limit: number,
    offset: number,
  ): Promise<FindAllMatchesResponse> {
    const [matches, totalCount] = await prisma.$transaction([
      prisma.match.findMany({
        take: limit,
        skip: offset,
        orderBy: {
          MatchDate: "desc",
        },
        include: {
          _count: {
            select: { players: true },
          },
        },
      }),
      prisma.match.count(),
    ]);
    return {
      matches,
      totalCount,
    };
  }

  /**
   *  Busca uma partida pelo ID (uuid).
   *  Inclui os jogadores inscritos com informações do usuário.
   *  @param matchId ID da partida (uuid).
   */
  async findById(matchId: string): Promise<MatchWithPlayers | null> {
    return prisma.match.findUnique({
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
  }

  /**
   * Encontra uma inscrição específica de um usuário em uma partida.
   * @param userId ID do usuário.
   * @param matchId ID da partida.
   */

  async findSubscription(
    userId: string,
    matchId: string,
  ): Promise<PlayerSubscription | null> {
    return prisma.playerSubscription.findUnique({
      where: {
        userId_matchId: {
          userId: userId,
          matchId: matchId,
        },
      },
    });
  }
  /**
   * Cria uma nova inscrição de jogador em uma partida.
   * @param userId ID do usuário.
   * @param matchId ID da partida.
   */
  async createSubscription(
    userId: string,
    matchId: string,
    team: TeamSide,
  ): Promise<PlayerSubscription> {
    return prisma.playerSubscription.create({
      data: {
        userId,
        matchId,
        team: team,
      },
    });
  }

  async updateSubscriptionTeam(
    subscriptionId: string,
    newTeam: TeamSide,
  ): Promise<PlayerSubscription> {
    return prisma.playerSubscription.update({
      where: { id: subscriptionId },
      data: { team: newTeam },
    });
  }

  /**
   * Remove uma inscrição de jogador de uma partida.
   * @param subscriptionId ID da inscrição.
   */
  async deleteSubscription(subscriptionId: string): Promise<void> {
    await prisma.playerSubscription.delete({
      where: { id: subscriptionId },
    });
  }
}

export default new MatchRepository();
