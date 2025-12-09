import { prisma } from "../../database/prisma.client";
import {
  Prisma,
  Match,
  User,
  PlayerSubscription,
  TeamSide,
} from "@prisma/client";

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

export class MatchRepository {
  constructor(private prismaClient = prisma) { }

  async createMatch(data: any, author: User): Promise<Match> {
    return this.prismaClient.$transaction(async (tx) => {
      const newMatch = await tx.match.create({
        data: {
          title: data.title,
          description: data.description,
          MatchDate: data.MatchDate,
          teamNameA: data.teamNameA,
          teamNameB: data.teamNameB,
          location: data.location,
          sport: data.sport,
          author: {
            connect: {
              id: author.id,
            },
          },
          maxPlayers: data.maxPlayers,
          players: {
            connect: data.players ? data.players.connect : [],
          },
          MatchStatus: "EM_BREVE",
        },
      });
      await tx.playerSubscription.create({
        data: {
          userId: author.id,
          matchId: newMatch.id,
          team: "A", // Autor sempre vai para o Time A
        },
      });
      return newMatch;
    });
  }

  async updateMatch(
    matchId: string,
    data: Prisma.MatchUpdateInput,
  ): Promise<Match> {
    return this.prismaClient.match.update({
      where: { id: matchId },
      data,
    });
  }

  async deleteMatch(matchId: string): Promise<Match> {
    const match = await this.prismaClient.match.delete({
      where: { id: matchId },
    });

    if (!match) {
      throw new Error("Match not found");
    }

    await this.prismaClient.playerSubscription.deleteMany({
      where: { matchId: matchId },
    });
    return match;
  }

  /**
   * Busca todas as partidas com paginação baseada em cursor.
   * @param limit - quantos itens deseja buscar
   * @param cursor - o ID (UUID) do último item visto (para começar depois dele)
   */
  async findAll(
    limit: number,
    offset: number,
  ): Promise<FindAllMatchesResponse> {
    const [matches, totalCount] = await this.prismaClient.$transaction([
      this.prismaClient.match.findMany({
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
      this.prismaClient.match.count(),
    ]);
    return {
      matches,
      totalCount,
    };
  }

  async findAllMatchesByUserId(userId: string): Promise<Match[]> {
    return prisma.match.findMany({
      where: { authorId: userId }, orderBy: {
        MatchDate: "desc",
      }
    })
  }

  /**
   *  Busca uma partida pelo ID (uuid).
   *  Inclui os jogadores inscritos com informações do usuário.
   *  @param matchId ID da partida (uuid).
   */
  async findById(matchId: string): Promise<MatchWithPlayers | null> {
    return this.prismaClient.match.findUnique({
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
    return this.prismaClient.playerSubscription.findUnique({
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
    return this.prismaClient.playerSubscription.create({
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
    return this.prismaClient.playerSubscription.update({
      where: { id: subscriptionId },
      data: { team: newTeam },
    });
  }

  /**
   * Remove uma inscrição de jogador de uma partida.
   * @param subscriptionId ID da inscrição.
   */
  async deleteSubscription(subscriptionId: string): Promise<void> {
    await this.prismaClient.playerSubscription.delete({
      where: { id: subscriptionId },
    });
  }
}

// Default export kept for backward compatibility
const defaultExport = new MatchRepository();
export default defaultExport;
