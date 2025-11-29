import notificationService from "../../modules/notification/notification.service";
import notificationRepository from "../../modules/notification/notification.repository";
import { NotificationType } from "@prisma/client";

// Mock do repositório
jest.mock("../../modules/notification/notification.repository");

// Helper para tipagem do mock
const repo = jest.mocked(notificationRepository);

describe("NotificationService", () => {
  const userId = "user-uuid-123";
  const notificationId = "notif-uuid-456";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ======================================================
  // SEND
  // ======================================================
  describe("send", () => {
    it("deve chamar repository.create com os dados corretos", async () => {
      // Arrange
      const sendData = {
        userId,
        type: NotificationType.SYSTEM,
        title: "Bem vindo",
        content: "Olá usuário",
        resourceId: "res-1",
        resourceType: "GROUP",
      };

      const mockCreatedNotification = { id: "n-1", ...sendData, readAt: null, createdAt: new Date() };
      repo.create.mockResolvedValue(mockCreatedNotification as any);

      // Act
      const result = await notificationService.send(
        sendData.userId,
        sendData.type,
        sendData.title,
        sendData.content,
        sendData.resourceId,
        sendData.resourceType
      );

      // Assert
      expect(repo.create).toHaveBeenCalledTimes(1);
      expect(repo.create).toHaveBeenCalledWith({
        userId: sendData.userId,
        type: sendData.type,
        title: sendData.title,
        content: sendData.content,
        resourceId: sendData.resourceId,
        resourceType: sendData.resourceType,
      });
      expect(result).toEqual(mockCreatedNotification);
    });

    it("deve funcionar sem resourceId e resourceType (opcionais)", async () => {
      // Arrange
      const sendData = {
        userId,
        type: NotificationType.SYSTEM,
        title: "Aviso Simples",
        content: "Sem link",
      };

      repo.create.mockResolvedValue({ id: "n-1", ...sendData } as any);

      // Act
      await notificationService.send(
        sendData.userId,
        sendData.type,
        sendData.title,
        sendData.content
      );

      // Assert
      expect(repo.create).toHaveBeenCalledWith({
        userId: sendData.userId,
        type: sendData.type,
        title: sendData.title,
        content: sendData.content,
        resourceId: undefined,
        resourceType: undefined,
      });
    });
  });

  // ======================================================
  // GET USER NOTIFICATIONS
  // ======================================================
  describe("getUserNotifications", () => {
    it("deve chamar repository.findByUserId", async () => {
      // Arrange
      const mockList = [{ id: "1", title: "Notif 1" }];
      repo.findByUserId.mockResolvedValue(mockList as any);

      // Act
      const result = await notificationService.getUserNotifications(userId);

      // Assert
      expect(repo.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockList);
    });
  });

  // ======================================================
  // GET UNREAD COUNT
  // ======================================================
  describe("getUnreadCount", () => {
    it("deve chamar repository.countUnread", async () => {
      // Arrange
      const mockCount = 5;
      repo.countUnread.mockResolvedValue(mockCount);

      // Act
      const result = await notificationService.getUnreadCount(userId);

      // Assert
      expect(repo.countUnread).toHaveBeenCalledWith(userId);
      expect(result).toBe(mockCount);
    });
  });

  // ======================================================
  // MARK AS READ
  // ======================================================
  describe("markAsRead", () => {
    it("deve chamar repository.markAsRead", async () => {
      // Arrange
      const mockUpdated = { id: notificationId, readAt: new Date() };
      repo.markAsRead.mockResolvedValue(mockUpdated as any);

      // Act
      const result = await notificationService.markAsRead(notificationId);

      // Assert
      expect(repo.markAsRead).toHaveBeenCalledWith(notificationId);
      expect(result).toEqual(mockUpdated);
    });
  });

  // ======================================================
  // MARK ALL AS READ
  // ======================================================
  describe("markAllAsRead", () => {
    it("deve chamar repository.markAllAsRead", async () => {
      // Arrange
      const mockBatchPayload = { count: 10 };
      repo.markAllAsRead.mockResolvedValue(mockBatchPayload as any);

      // Act
      const result = await notificationService.markAllAsRead(userId);

      // Assert
      expect(repo.markAllAsRead).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockBatchPayload);
    });
  });
});