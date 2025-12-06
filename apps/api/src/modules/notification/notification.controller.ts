import { Request, Response, NextFunction } from "express";
import { NotificationsService } from "./notification.service";
import notificationService from "./notification.service";
import httpStatus from "http-status";

export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  /**
   * POST /notifications/token
   * Salva ou atualiza o token push do usuário autenticado
   */
  savePushToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore -- User is authenticated by auth middleware
      const userId = req.user?.userId;
      const { token } = req.body;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      await this.notificationsService.savePushToken(userId, token);

      return res.status(200).json({
        message: "Push token saved successfully",
        userId,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /notifications/token
   * Remove o token push do usuário autenticado
   */
  deletePushToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      await this.notificationsService.removePushToken(userId);

      return res.status(200).json({
        message: "Push token deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /notifications
   * Lista todas as notificações do usuário autenticado
   */
  list = async (req: Request, res: Response) => {
    const { id: userId } = (req as any).user!;

    const notifications =
      await notificationService.getUserNotifications(userId);

    return res.status(httpStatus.OK).json(notifications);
  };

  /**
   * GET /notifications/unread-count
   * Retorna a contagem de notificações não lidas
   */
  getUnreadCount = async (req: Request, res: Response) => {
    const { id: userId } = (req as any).user!;

    const count = await notificationService.getUnreadCount(userId);

    return res.status(httpStatus.OK).json({ count });
  };

  /**
   * PATCH /notifications/:id/read
   * Marca uma notificação específica como lida
   */
  markAsRead = async (req: Request, res: Response) => {
    const { id: notificationId } = req.params;

    if (!notificationId) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "É necessário o ID de notificação" });
    }

    await notificationService.markAsRead(notificationId);

    return res.status(httpStatus.NO_CONTENT).send();
  };

  /**
   * PATCH /notifications/read-all
   * Marca todas as notificações do usuário como lidas
   */
  markAllAsRead = async (req: Request, res: Response) => {
    const { id: userId } = (req as any).user!;
    await notificationService.markAllAsRead(userId);
    return res.status(httpStatus.NO_CONTENT).send();
  };
}

// Export singleton instance for backward compatibility
export default new NotificationsController(notificationService);
