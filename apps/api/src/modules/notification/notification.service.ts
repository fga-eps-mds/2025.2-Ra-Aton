import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { NotificationsRepository } from "./notification.repository";
import notificationRepository from "./notification.repository";
import { NotificationType } from "@prisma/client";

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
  badge?: number;
}

export class NotificationsService {
  private expo: Expo;

  constructor(private notificationsRepository: NotificationsRepository) {
    this.expo = new Expo();
  }

  /**
   * Salva ou atualiza o token push do usuário
   */
  async savePushToken(userId: string, token: string) {
    // Valida se o token é um Expo Push Token válido
    if (!Expo.isExpoPushToken(token)) {
      throw new Error("Invalid Expo Push Token");
    }

    return this.notificationsRepository.upsertPushToken(userId, token);
  }

  /**
   * Remove o token push do usuário
   */
  async removePushToken(userId: string) {
    return this.notificationsRepository.deletePushToken(userId);
  }

  /**
   * Envia notificação para um usuário específico
   */
  async sendToUser(userId: string, payload: NotificationPayload) {
    const userToken =
      await this.notificationsRepository.getUserPushToken(userId);

    if (!userToken) {
      console.warn(`User ${userId} does not have a push token`);
      return null;
    }

    return this.sendPushNotifications([userToken.token], payload);
  }

  /**
   * Envia notificação para múltiplos usuários
   */
  async sendToUsers(userIds: string[], payload: NotificationPayload) {
    const userTokens =
      await this.notificationsRepository.getUsersPushTokens(userIds);

    if (userTokens.length === 0) {
      console.warn("No users with push tokens found");
      return null;
    }

    const tokens = userTokens.map(
      (ut: { userId: string; token: string }) => ut.token,
    );
    return this.sendPushNotifications(tokens, payload);
  }

  /**
   * Envia notificação para todos os membros de um grupo
   */
  async sendToGroup(
    groupId: string,
    payload: NotificationPayload,
    excludeUserIds: string[] = [],
  ) {
    const memberTokens =
      await this.notificationsRepository.getGroupMemberTokens(groupId);

    const filteredTokens = memberTokens
      .filter((mt) => !excludeUserIds.includes(mt.userId))
      .map((mt) => mt.token);

    if (filteredTokens.length === 0) {
      console.warn(`No members with push tokens found in group ${groupId}`);
      return null;
    }

    return this.sendPushNotifications(filteredTokens, payload);
  }

  /**
   * Envia notificações push usando Expo Push API
   */
  private async sendPushNotifications(
    tokens: string[],
    payload: NotificationPayload,
  ) {
    const messages: ExpoPushMessage[] = tokens.map((token) => ({
      to: token,
      sound: payload.sound || "default",
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      badge: payload.badge,
    }));

    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("Error sending push notification chunk:", error);
      }
    }

    return tickets;
  }

  /**
   * Métodos para notificações persistentes no banco de dados
   */
  async send(
    userId: string,
    type: NotificationType,
    title: string,
    content: string,
    resourceId?: string,
    resourceType?: string,
  ) {
    return notificationRepository.create({
      userId,
      type,
      title,
      content,
      resourceId,
      resourceType,
    });
  }

  async getUserNotifications(userId: string) {
    return notificationRepository.findByUserId(userId);
  }

  async getUnreadCount(userId: string) {
    return notificationRepository.countUnread(userId);
  }

  async markAsRead(notificationId: string) {
    return notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string) {
    return notificationRepository.markAllAsRead(userId);
  }
}

// Export singleton instance for backward compatibility
export default new NotificationsService(notificationRepository);
