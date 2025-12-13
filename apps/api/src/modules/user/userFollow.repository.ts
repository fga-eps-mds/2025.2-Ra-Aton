import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class UserFollowRepository {
  /**
   * Cria um relacionamento de seguir entre usuários
   */
  async createFollow(followerId: string, followingId: string) {
    return await prisma.userFollow.create({
      data: {
        followerId,
        followingId,
      },
    });
  }

  /**
   * Remove um relacionamento de seguir entre usuários
   */
  async deleteFollow(followerId: string, followingId: string) {
    return await prisma.userFollow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  /**
   * Verifica se um usuário está seguindo outro
   */
  async findFollow(followerId: string, followingId: string) {
    return await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  /**
   * Busca todos os seguidores de um usuário
   */
  async findFollowers(userId: string, limit: number, offset: number) {
    const followers = await prisma.userFollow.findMany({
      where: { followingId: userId },
      select: {
        follower: {
          select: {
            id: true,
            userName: true,
            name: true,
            profileImageUrl: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });

    const totalCount = await prisma.userFollow.count({
      where: { followingId: userId },
    });

    return { followers: followers.map((f) => f.follower), totalCount };
  }

  /**
   * Busca todos os usuários que um usuário está seguindo
   */
  async findFollowing(userId: string, limit: number, offset: number) {
    const following = await prisma.userFollow.findMany({
      where: { followerId: userId },
      select: {
        following: {
          select: {
            id: true,
            userName: true,
            name: true,
            profileImageUrl: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });

    const totalCount = await prisma.userFollow.count({
      where: { followerId: userId },
    });

    return { following: following.map((f) => f.following), totalCount };
  }
}

export default new UserFollowRepository();
