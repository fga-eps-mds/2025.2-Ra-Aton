import { NotificationsService } from "../../modules/notification/notification.service";
import notificationService from "../../modules/notification/notification.service";
import notificationRepository from "../../modules/notification/notification.repository";
import { NotificationType } from "@prisma/client";

// Mock do expo-server-sdk
jest.mock("expo-server-sdk", () => {
  const sendPushNotificationsAsync = jest.fn(async (chunk: any) => {
    return chunk.map((m: any, i: number) => ({ status: "ok", id: `t-${i}` }));
  });

  const Expo = jest.fn().mockImplementation(() => ({
    chunkPushNotifications: (messages: any[]) => [messages],
    sendPushNotificationsAsync,
  }));

  // isExpoPushToken é usado estaticamente
  // Simula que tokens que começam com 'Expo' são válidos
  (Expo as any).isExpoPushToken = (token: string) =>
    typeof token === "string" && token.startsWith("Expo");

  return { Expo };
});

// Mock do repositório
jest.mock("../../modules/notification/notification.repository");

// Helper para tipagem do mock
const repo = jest.mocked(notificationRepository);

describe("NotificationsService", () => {
  const userId = "user-uuid-123";
  const notificationId = "notif-uuid-456";

  const mockRepo = {
    upsertPushToken: jest.fn(),
    deletePushToken: jest.fn(),
    getUserPushToken: jest.fn(),
    getUsersPushTokens: jest.fn(),
    getGroupMemberTokens: jest.fn(),
    create: jest.fn(),
    findByUserId: jest.fn(),
    countUnread: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  } as any;

  const service = new NotificationsService(mockRepo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ======================================================
  // PUSH NOTIFICATIONS - EXPO TOKEN MANAGEMENT
  // ======================================================
  describe("savePushToken", () => {
    it("should throw when token is invalid", async () => {
      await expect(
        service.savePushToken("U1", "invalid-token"),
      ).rejects.toThrow("Invalid Expo Push Token");
      expect(mockRepo.upsertPushToken).not.toHaveBeenCalled();
    });

    it("should call repository.upsertPushToken when token is valid", async () => {
      mockRepo.upsertPushToken.mockResolvedValue({
        userId: "U1",
        token: "ExpoABC",
      });

      const result = await service.savePushToken("U1", "ExpoABC");

      expect(mockRepo.upsertPushToken).toHaveBeenCalledWith("U1", "ExpoABC");
      expect(result).toEqual({ userId: "U1", token: "ExpoABC" });
    });
  });

  describe("removePushToken", () => {
    it("should call repository.deletePushToken", async () => {
      mockRepo.deletePushToken.mockResolvedValue(true);

      const result = await service.removePushToken("U1");

      expect(mockRepo.deletePushToken).toHaveBeenCalledWith("U1");
      expect(result).toBeTruthy();
    });
  });

  describe("sendToUser", () => {
    it("should return null when user has no token", async () => {
      mockRepo.getUserPushToken.mockResolvedValue(null);

      const res = await service.sendToUser("U-X", { title: "t", body: "b" });
      expect(res).toBeNull();
    });

    it("should send notification when token exists", async () => {
      mockRepo.getUserPushToken.mockResolvedValue({ token: "ExpoTOKEN" });

      const res = await service.sendToUser("U1", { title: "t", body: "b" });

      // espera que o mock do expo retorne tickets
      expect(res).toBeDefined();
      // sendPushNotificationsAsync é chamado internamente (mocked in expo-server-sdk)
    });
  });

  describe("sendToUsers", () => {
    it("should return null when no tokens found", async () => {
      mockRepo.getUsersPushTokens.mockResolvedValue([]);

      const res = await service.sendToUsers(["U1", "U2"], {
        title: "t",
        body: "b",
      });
      expect(res).toBeNull();
    });

    it("should send notifications to multiple users", async () => {
      mockRepo.getUsersPushTokens.mockResolvedValue([
        { userId: "U1", token: "Expo1" },
        { userId: "U2", token: "Expo2" },
      ]);

      const res = await service.sendToUsers(["U1", "U2"], {
        title: "t",
        body: "b",
      });

      expect(res).toBeDefined();
    });
  });

  describe("sendToGroup", () => {
    it("should return null if no member tokens", async () => {
      mockRepo.getGroupMemberTokens.mockResolvedValue([]);

      const res = await service.sendToGroup("G1", { title: "t", body: "b" });
      expect(res).toBeNull();
    });

    it("should send to group members excluding specified users", async () => {
      mockRepo.getGroupMemberTokens.mockResolvedValue([
        { userId: "A", token: "ExpoA" },
        { userId: "B", token: "ExpoB" },
      ]);

      const res = await service.sendToGroup("G1", { title: "t", body: "b" }, [
        "A",
      ]);
      expect(res).toBeDefined();
    });
  });

  // ======================================================
  // IN-APP NOTIFICATIONS - DATABASE PERSISTENCE
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

      const mockCreatedNotification = {
        id: "n-1",
        ...sendData,
        readAt: null,
        createdAt: new Date(),
      };
      repo.create.mockResolvedValue(mockCreatedNotification as any);

      // Act
      const result = await notificationService.send(
        sendData.userId,
        sendData.type,
        sendData.title,
        sendData.content,
        sendData.resourceId,
        sendData.resourceType,
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
        sendData.content,
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
