import { prisma } from "../../database/prisma.client";
import { Prisma, Match, User } from "@prisma/client";

class matchRepository {
  async findAllMatchs(): Promise<Match[]> {
    return prisma.match.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findMatchById(id: string): Promise<Match | null> {
    return prisma.match.findUnique({ where: { id } });
  }

  async createMatch(
    data: Prisma.MatchCreateInput,
    author: User,
  ): Promise<Match> {
    return prisma.$transaction(async (tx) => {
      const newMatch = await tx.match.create({
        data: {
          title: data.title,
          description: data.description,
          MatchDate: data.MatchDate,
          teamNameA: data.teamNameA,
          teamNameB: data.teamNameB,
          location: data.location,
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
    return prisma.match.update({
      where: { id: matchId },
      data,
    });
  }

  async deleteMatch(matchId: string): Promise<void> {
    await prisma.match.delete({
      where: { id: matchId },
    });
  }
}

export default new matchRepository();
