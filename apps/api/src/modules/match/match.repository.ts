import { prisma } from "../../database/prisma.client";
import { Prisma, Match, PlayerSubscription } from "@prisma/client";

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

/**
 *  Busca todas as partidas.
 *  Inclui a contagem de jogadores inscritos.
 */
class MatchRepository {
  async findAll(): Promise<(Match & { _count: { players: number } })[]> {
    return prisma.match.findMany({
      orderBy: {
        date: "asc",
      },
      include: {
        _count: {
          select: { players: true },
        },
      },
    });
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
  ): Promise<PlayerSubscription> {
    return prisma.playerSubscription.create({
      data: {
        userId,
        matchId,
      },
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
