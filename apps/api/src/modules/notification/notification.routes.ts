import { Router } from "express";
import { NotificationsController } from "./notification.controller";
import { NotificationsService } from "./notification.service";
import { NotificationsRepository } from "./notification.repository";
import notificationController from "./notification.controller";
import validateRequest from "../../middlewares/validateRequest";
import { SavePushTokenSchema } from "./notification.schema";
import { auth } from "../../middlewares/auth";
import { prisma } from "../../database/prisma.client";

const router: Router = Router();

// Dependency Injection
const notificationsRepository = new NotificationsRepository(prisma);
const notificationsService = new NotificationsService(notificationsRepository);
const notificationsController = new NotificationsController(
  notificationsService,
);

/**
 * Push Notification Token Management
 */

/**
 * @route POST /notifications/token
 * @desc Salva ou atualiza o token push do usuário autenticado
 * @access Private
 */
router.post(
  "/token",
  auth,
  validateRequest(SavePushTokenSchema),
  notificationsController.savePushToken,
);

/**
 * @route DELETE /notifications/token
 * @desc Remove o token push do usuário autenticado
 * @access Private
 */
router.delete("/token", auth, notificationsController.deletePushToken);

/**
 * In-App Notifications (Database)
 */

/**
 * @route GET /notifications
 * @desc Lista todas as notificações do usuário autenticado
 * @access Private
 */
router.get("/", auth, notificationController.list);

/**
 * @route GET /notifications/unread-count
 * @desc Retorna a contagem de notificações não lidas
 * @access Private
 */
router.get("/unread-count", auth, notificationController.getUnreadCount);

/**
 * @route PATCH /notifications/:id/read
 * @desc Marca uma notificação específica como lida
 * @access Private
 */
router.patch("/:id/read", auth, notificationController.markAsRead);

/**
 * @route PATCH /notifications/read-all
 * @desc Marca todas as notificações do usuário como lidas
 * @access Private
 */
router.patch("/read-all", auth, notificationController.markAllAsRead);

export default router;
