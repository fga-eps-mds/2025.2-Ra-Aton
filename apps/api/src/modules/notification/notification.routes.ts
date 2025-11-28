import { Router } from 'express';
import { NotificationsController } from './notification.controller';
import { NotificationsService } from './notification.service';
import { NotificationsRepository } from './notification.repository';
import validateRequest from '../../middlewares/validateRequest';
import { SavePushTokenSchema } from './notification.schema';
import { auth } from '../../middlewares/auth';
import { prisma } from '../../database/prisma.client';

const router: Router = Router();

// Dependency Injection
const notificationsRepository = new NotificationsRepository(prisma);
const notificationsService = new NotificationsService(notificationsRepository);
const notificationsController = new NotificationsController(notificationsService);

/**
 * @route POST /notifications/token
 * @desc Salva ou atualiza o token push do usuário autenticado
 * @access Private
 */
router.post(
  '/token',
  auth,
  validateRequest(SavePushTokenSchema),
  notificationsController.savePushToken
);

/**
 * @route DELETE /notifications/token
 * @desc Remove o token push do usuário autenticado
 * @access Private
 */
router.delete(
  '/token',
  auth,
  notificationsController.deletePushToken
);

export default router;
