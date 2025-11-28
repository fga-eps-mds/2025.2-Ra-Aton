import {notificationService} from "../../modules/notification/notification.service";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import { notificationRepository } from "../../modules/notification/notification.repository";
import { GroupRole } from "@prisma/client";

jest.mock("../../modules/notification/notification.repository");

describe("NotificationService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAllNotifications", () => {
    it("Deve retornar uma lista com todas as notificações existentes", async () => {
      const mockNotifications = [
        {
          id: "N1",
          userId: "U1",
          title: "Notification 1",
          message: "This is the first notification",
          isRead: false,
          createdAt: new Date("2023-01-01T00:00:00Z"),
        },
        {
          id: "N2",
          userId: "U2",
          title: "Notification 2",
          message: "This is the second notification",
          isRead: true,
          createdAt: new Date("2023-02-01T00:00:00Z"),
        },
      ];

      (notificationRepository.findAllNotifications as jest.Mock).mockResolvedValue(
        mockNotifications,
      );

      const notifications = await notificationService.findAllNotifications();

      expect(notifications).toEqual(mockNotifications);
      expect(notificationRepository.findAllNotifications).toHaveBeenCalled();
    });
  });

  describe("findNotificationById", () => {
    it("Deve retornar uma notificação a partir de seu id", async () => {
      const mockNotification = {
        id: "N1",
        userId: "U1",
        title: "Notification 1",
        message: "This is the first notification",
        isRead: false,
        createdAt: new Date("2023-01-01T00:00:00Z"),
      };
      (notificationRepository.findNotificationById as jest.Mock).mockResolvedValue(
        mockNotification,
      );

      const notification = await notificationService.findNotificationById("N1");

      expect(notification).toEqual(mockNotification);
      expect(notificationRepository.findNotificationById).toHaveBeenCalledWith(
        "N1",
      );
    });

    it("Deve lançar um erro se a notificação não for encontrada", async () => {
      (notificationRepository.findNotificationById as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        notificationService.findNotificationById("InvalidID"),
      ).rejects.toEqual(
        new ApiError(
          httpStatus.NOT_FOUND,
          "Notificação não encontrada",
        ),
      );

      expect(notificationRepository.findNotificationById).toHaveBeenCalledWith(
        "InvalidID",
      );
    });
  });
});
