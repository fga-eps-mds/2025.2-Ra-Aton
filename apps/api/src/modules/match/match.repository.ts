import { prisma } from "../../database/prisma.client";
import { Prisma, Match } from "@prisma/client";

class matchRepository {
  async findAllMatchs(): Promise<Match[]> {
    return prisma.match.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findMatchById(id: string): Promise<Match | null> {
    return prisma.match.findUnique({ where: { id } });
  }

  async createMatch(
    data: Prisma.MatchCreateInput,
    authorId: string,
    groupId: string | undefined,
  ): Promise<Match> {
    if (data.group) {
      return prisma.match.create({
      data: {
        title: data.title,
        content: data.content,
        eventDate: data.eventDate,
        eventFinishDate: data.eventFinishDate,
        location: data.location,
        author: {
          connect: {
            id: authorId,
          },
        },
        group: {
          connect: {
            id: groupId
          }
        },
        teams: data.teams,
      },
    });
    }
    return prisma.match.create({
      data: {
        title: data.title,
        content: data.content,
        eventDate: data.eventDate,
        eventFinishDate: data.eventFinishDate,
        location: data.location,
        author: {
          connect: {
            id: authorId,
          },
        },
        teams: data.teams,
      },
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