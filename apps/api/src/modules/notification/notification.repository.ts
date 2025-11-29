import { prisma } from "../../database/prisma.client";
import { NotificationType } from "@prisma/client";

class NotificationRepository {
    async create(data: {
        userId: string;
        title: string;
        content: string;
        type: NotificationType;
        resourceId?: string;
        resourceType?: string;
    }) {
        return prisma.notification.create({
            data: {
                ...data,
                readAt: null,
            },
        });
    }

    async findByUserId(userId: string) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    async countUnread(userId: string): Promise<number> {
        return prisma.notification.count({
            where: {
                userId,
                readAt: null,
            },
        });
    }

    async markAsRead(notificationId: string) {
        return prisma.notification.update({
            where: { id: notificationId },
            data: { readAt: new Date() },
        });
    }

    async markAllAsRead(userId: string) {
        return prisma.notification.updateMany({
            where: { userId, readAt: null },
            data: { readAt: new Date() },
        });
    }
}

export default new NotificationRepository();