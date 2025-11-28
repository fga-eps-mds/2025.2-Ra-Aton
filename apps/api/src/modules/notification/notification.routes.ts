import { Router } from "express";
import notificationController from "./notification.controller";
import { auth } from "../../middlewares/auth";

const router: Router = Router();

router.get("/", auth, notificationController.list); // listar notificações do usuário

router.patch("/:id/read", auth, notificationController.markAsRead); // marcar como lida

router.patch("/read-all", auth, notificationController.markAllAsRead); // marcar todas como lidas

export default router;