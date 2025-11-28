import { Request, Response, NextFunction } from 'express';
import { NotificationsService } from '../modules/notification/notification.service';
import { NotificationsRepository } from '../modules/notification/notification.repository';
import { prisma } from '../database/prisma.client';

// Instância singleton do serviço de notificações
const notificationsRepository = new NotificationsRepository(prisma);
const notificationsService = new NotificationsService(notificationsRepository);

/**
 * Middleware genérico para notificações de grupo
 * Exemplo: nova publicação, novo membro, etc.
 */
export const notifyGroupMembers = (config: {
  getGroupId: (req: Request, res: Response) => string;
  getTitle: (req: Request, res: Response) => string;
  getBody: (req: Request, res: Response) => string;
  getData?: (req: Request, res: Response) => Record<string, unknown>;
  excludeUserId?: (req: Request) => string | undefined;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const groupId = config.getGroupId(req, res);
      const excludeUserId = config.excludeUserId?.(req);

      if (groupId) {
        const title = config.getTitle(req, res);
        const body = config.getBody(req, res);
        const data = config.getData?.(req, res);

        // Envia notificação de forma assíncrona
        notificationsService.sendToGroup(
          groupId,
          { title, body, data },
          excludeUserId ? [excludeUserId] : []
        ).catch((error) => {
          console.error('❌ Erro ao enviar notificação para grupo:', error);
        });

        console.log(`✅ Notificação enviada para membros do grupo ${groupId}`);
      }

      next();
    } catch (error) {
      console.error('❌ Erro no middleware de notificação de grupo:', error);
      next();
    }
  };
};

/**
 * Middleware para notificar um usuário específico
 */
export const notifyUser = (config: {
  getUserId: (req: Request, res: Response) => string;
  getTitle: (req: Request, res: Response) => string;
  getBody: (req: Request, res: Response) => string;
  getData?: (req: Request, res: Response) => Record<string, unknown>;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = config.getUserId(req, res);

      if (userId) {
        const title = config.getTitle(req, res);
        const body = config.getBody(req, res);
        const data = config.getData?.(req, res);

        // Envia notificação de forma assíncrona
        notificationsService.sendToUser(userId, { title, body, data })
          .catch((error) => {
            console.error('❌ Erro ao enviar notificação para usuário:', error);
          });

        console.log(`✅ Notificação enviada para usuário ${userId}`);
      }

      next();
    } catch (error) {
      console.error('❌ Erro no middleware de notificação:', error);
      next();
    }
  };
};
