import { Request, Response, NextFunction } from 'express';
import { NotificationsService } from './notifications.service';

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
        return res.status(401).json({ error: 'User not authenticated' });
      }

      await this.notificationsService.savePushToken(userId, token);

      return res.status(200).json({ 
        message: 'Push token saved successfully',
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
        return res.status(401).json({ error: 'User not authenticated' });
      }

      await this.notificationsService.removePushToken(userId);

      return res.status(200).json({ 
        message: 'Push token deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
