import { api_route } from "@/libs/auth/api";

// Interface baseada no retorno do Prisma/Backend
export interface NotificationAPI {
  id: string;
  title: string;
  content: string;
  type: string; // Ex: 'GROUP_JOIN_REQUEST', 'MATCH_REMINDER'
  resourceId?: string;
  resourceType?: string; // Ex: 'GROUP', 'MATCH'
  readAt: string | null; // Data ISO ou null se não lida
  createdAt: string;     // Data ISO
}

type UnreadCountResponse = {
  count: number;
};

/**
 * GET /notifications
 */
export async function getUserNotifications(): Promise<NotificationAPI[]> {
  const res = await api_route.get<NotificationAPI[]>("/notifications");
  // Se o seu interceptor do axios já retorna 'response.data', mude para 'return res;'
  return res.data; 
}

/**
 * GET /notifications/unread-count
 */
export async function getUnreadNotificationsCount(): Promise<number> {
  const res = await api_route.get<UnreadCountResponse>("/notifications/unread-count");
  return res.data.count;
}

/**
 * PATCH /notifications/:id/read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await api_route.patch(`/notifications/${notificationId}/read`);
}

/**
 * PATCH /notifications/read-all
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  await api_route.patch("/notifications/read-all");
}