import { Request, Response } from "express";
import httpStatus from "http-status";
import notificationController from "../../modules/notification/notification.controller";
import notificationService from "../../modules/notification/notification.service";

// Mock do serviço de notificação
jest.mock("../../modules/notification/notification.service");

describe("NotificationController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let sendMock: jest.Mock;

  const mockUserId = "user-uuid-123";

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup dos mocks do Express
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    sendMock = jest.fn().mockReturnThis();

    res = {
      status: statusMock,
      json: jsonMock,
      send: sendMock,
    };
  });

  // ===========================================
  // LIST (Listar Notificações)
  // ===========================================
  describe("list", () => {
    it("deve retornar lista de notificações com status 200", async () => {
      // Arrange
      const mockNotifications = [
        { id: "1", title: "Teste", userId: mockUserId },
      ];
      
      req = {
        user: { id: mockUserId },
      } as any;

      (notificationService.getUserNotifications as jest.Mock).mockResolvedValue(
        mockNotifications
      );

      // Act
      await notificationController.list(req as Request, res as Response);

      // Assert
      expect(notificationService.getUserNotifications).toHaveBeenCalledWith(
        mockUserId
      );
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockNotifications);
    });
  });

  // ===========================================
  // GET UNREAD COUNT (Contar não lidas)
  // ===========================================
  describe("getUnreadCount", () => {
    it("deve retornar a contagem com status 200", async () => {
      // Arrange
      const mockCount = 5;
      
      req = {
        user: { id: mockUserId },
      } as any;

      (notificationService.getUnreadCount as jest.Mock).mockResolvedValue(
        mockCount
      );

      // Act
      await notificationController.getUnreadCount(req as Request, res as Response);

      // Assert
      expect(notificationService.getUnreadCount).toHaveBeenCalledWith(mockUserId);
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({ count: mockCount });
    });
  });

  // ===========================================
  // MARK AS READ (Marcar uma como lida)
  // ===========================================
  describe("markAsRead", () => {
    it("deve marcar notificação como lida e retornar 204", async () => {
      // Arrange
      req = {
        params: { id: "notif-1" },
      } as unknown as Request;

      (notificationService.markAsRead as jest.Mock).mockResolvedValue(undefined);

      // Act
      await notificationController.markAsRead(req as Request, res as Response);

      // Assert
      expect(notificationService.markAsRead).toHaveBeenCalledWith("notif-1");
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });

    it("deve retornar 400 se o ID da notificação não for fornecido", async () => {
      // Arrange
      req = {
        params: {}, // ID ausente
      } as unknown as Request;

      // Act
      await notificationController.markAsRead(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "É necessário o ID de notificação",
      });
      // Garante que o serviço NÃO foi chamado
      expect(notificationService.markAsRead).not.toHaveBeenCalled();
    });
  });

  // ===========================================
  // MARK ALL AS READ (Marcar todas como lidas)
  // ===========================================
  describe("markAllAsRead", () => {
    it("deve marcar todas como lidas e retornar 204", async () => {
      // Arrange
      req = {
        user: { id: mockUserId },
      } as any;

      (notificationService.markAllAsRead as jest.Mock).mockResolvedValue(undefined);

      // Act
      await notificationController.markAllAsRead(req as Request, res as Response);

      // Assert
      expect(notificationService.markAllAsRead).toHaveBeenCalledWith(mockUserId);
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });
  });
});