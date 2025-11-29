import notificationRepository from "../../modules/notification/notification.repository";
import { NotificationType } from "@prisma/client";
// Importe o seu mock configurado (ajuste o caminho conforme sua estrutura, ex: '../testMocks')
import { prismaMock } from "../../__tests__/prisma-mock"; 

describe("NotificationRepository", () => {
  const userId = "user-uuid-123";
  const notificationId = "notif-uuid-456";
  const mockDate = new Date();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ======================================================
  // CREATE
  // ======================================================
  describe("create", () => {
    it("deve criar uma notificação no banco", async () => {
      // Arrange
      const data = {
        userId,
        title: "Nova mensagem",
        content: "Você recebeu algo",
        type: NotificationType.SYSTEM,
        resourceId: "res-1",
        resourceType: "GROUP",
      };

      const mockCreated = {
        id: "n-1",
        ...data,
        readAt: null,
        createdAt: mockDate,
      };

      prismaMock.notification.create.mockResolvedValue(mockCreated as any);

      // Act
      const result = await notificationRepository.create(data);

      // Assert
      expect(result).toEqual(mockCreated);
      expect(prismaMock.notification.create).toHaveBeenCalledWith({
        data: {
          ...data,
          readAt: null, // Repositório deve forçar null na criação
        },
      });
    });
  });

  // ======================================================
  // FIND BY USER ID
  // ======================================================
  describe("findByUserId", () => {
    it("deve buscar notificações ordenadas por data", async () => {
      // Arrange
      const mockList = [
        { id: "n-1", title: "Recente", createdAt: new Date() },
        { id: "n-2", title: "Antiga", createdAt: new Date(Date.now() - 10000) },
      ];

      prismaMock.notification.findMany.mockResolvedValue(mockList as any);

      // Act
      const result = await notificationRepository.findByUserId(userId);

      // Assert
      expect(result).toEqual(mockList);
      expect(prismaMock.notification.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  // ======================================================
  // COUNT UNREAD
  // ======================================================
  describe("countUnread", () => {
    it("deve contar apenas notificações onde readAt é null", async () => {
      // Arrange
      const mockCount = 3;
      prismaMock.notification.count.mockResolvedValue(mockCount);

      // Act
      const result = await notificationRepository.countUnread(userId);

      // Assert
      expect(result).toBe(mockCount);
      expect(prismaMock.notification.count).toHaveBeenCalledWith({
        where: {
          userId,
          readAt: null,
        },
      });
    });
  });

  // ======================================================
  // MARK AS READ
  // ======================================================
  describe("markAsRead", () => {
    it("deve atualizar readAt com a data atual", async () => {
      // Arrange
      const mockUpdated = { id: notificationId, readAt: mockDate };
      prismaMock.notification.update.mockResolvedValue(mockUpdated as any);

      // Act
      const result = await notificationRepository.markAsRead(notificationId);

      // Assert
      expect(result).toEqual(mockUpdated);
      expect(prismaMock.notification.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: {
          // Como 'new Date()' é gerado dentro do repositório, 
          // usamos expect.any(Date) para validar
          readAt: expect.any(Date), 
        },
      });
    });
  });

  // ======================================================
  // MARK ALL AS READ
  // ======================================================
  describe("markAllAsRead", () => {
    it("deve atualizar todas as não lidas do usuário", async () => {
      // Arrange
      const mockBatchPayload = { count: 5 };
      prismaMock.notification.updateMany.mockResolvedValue(mockBatchPayload);

      // Act
      const result = await notificationRepository.markAllAsRead(userId);

      // Assert
      expect(result).toEqual(mockBatchPayload);
      expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({
        where: { 
          userId, 
          readAt: null // Garante que só atualiza as que não foram lidas
        },
        data: { 
          readAt: expect.any(Date), 
        },
      });
    });
  });
});