import { PrismaClient } from "@prisma/client";
import { prisma } from "../../database/prisma.client";
import { NotificationType } from "@prisma/client";

export class NotificationsRepository {
  constructor(private prismaClient: PrismaClient) {}

  /**
   * Salva ou atualiza o token de notificação do usuário
   * Se o token já existir em outro usuário, remove-o antes
   */
  async upsertPushToken(userId: string, token: string) {
    return this.prismaClient.$transaction(async (tx) => {
      // Remove o token de qualquer outro usuário que possa tê-lo
      await tx.usersNotifyTokens.deleteMany({
        where: {
          token,
          userId: { not: userId },
        },
      });

      // Agora faz o upsert para o usuário atual
      return tx.usersNotifyTokens.upsert({
        where: { userId },
        create: {
          userId,
          token,
        },
        update: {
          token,
          updatedAt: new Date(),
        },
      });
    });
  }

  /**
   * Busca o token de um usuário específico
   */
  async getUserPushToken(userId: string) {
    return this.prismaClient.usersNotifyTokens.findUnique({
      where: { userId },
    });
  }

  /**
   * Busca tokens de múltiplos usuários (para envio em massa)
   */
  async getUsersPushTokens(userIds: string[]) {
    return this.prismaClient.usersNotifyTokens.findMany({
      where: {
        userId: { in: userIds },
      },
      select: {
        userId: true,
        token: true,
      },
    });
  }

  /**
   * Remove o token de um usuário (logout, por exemplo)
   */
  async deletePushToken(userId: string) {
    return this.prismaClient.usersNotifyTokens.delete({
      where: { userId },
    });
  }

  /**
   * Busca todos os membros de um grupo com seus tokens
   */
  async getGroupMemberTokens(groupId: string) {
    const memberships = await this.prismaClient.groupMembership.findMany({
      where: { groupId },
      include: {
        user: {
          include: {
            notifyTokens: true,
          },
        },
      },
    });

    return memberships
      .filter((m) => m.user.notifyTokens.length > 0 && m.user.notifyTokens[0])
      .map((m) => ({
        userId: m.userId,
        token: m.user.notifyTokens[0]!.token,
        role: m.role,
      }));
  }
  async create(data: {
    userId: string;
    title: string;
    content: string;
    type: NotificationType;
    resourceId?: string;
    resourceType?: string;
  }) {
    return this.prismaClient.notification.create({
      data: {
        ...data,
        readAt: null,
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prismaClient.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async countUnread(userId: string): Promise<number> {
    return this.prismaClient.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });
  }

  async markAsRead(notificationId: string) {
    return this.prismaClient.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prismaClient.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}

// Export singleton instance for backward compatibility
export default new NotificationsRepository(prisma);
