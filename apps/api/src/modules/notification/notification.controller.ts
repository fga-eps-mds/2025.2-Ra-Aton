import { Request, Response } from "express";
import notificationService from "./notification.service";
import httpStatus from "http-status";

class NotificationController {
  async list(req: Request, res: Response) {
    const { id: userId } = (req as any).user!;
    
    const notifications = await notificationService.getUserNotifications(userId);
    
    return res.status(httpStatus.OK).json(notifications);
  }

  async markAsRead(req: Request, res: Response) {
    const { id: notificationId } = req.params;

    if (!notificationId) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "É necessário o ID de notificação" });
    }

    await notificationService.markAsRead(notificationId);

    return res.status(httpStatus.NO_CONTENT).send();
  }
  
  async markAllAsRead(req: Request, res: Response) {
      const { id: userId } = (req as any).user!;
      await notificationService.markAllAsRead(userId);
      return res.status(httpStatus.NO_CONTENT).send();
  }
}

export default new NotificationController();