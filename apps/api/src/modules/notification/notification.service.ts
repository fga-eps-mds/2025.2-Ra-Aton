import notificationRepository from "./notification.repository";
import { NotificationType } from "@prisma/client";

class NotificationService {
    async send(userId: string, type: NotificationType, title: string, content: string, resourceId?: string, resourceType?: string) {
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

    async markAsRead(notificationId: string) {
        return notificationRepository.markAsRead(notificationId);
    }

    async markAllAsRead(userId: string) {
        return notificationRepository.markAllAsRead(userId);
    }
}

export default new NotificationService();