import { Router } from "express";
import profileController from "./profile.controller";

const router: Router = Router();

// Rota para obter o perfil de um usuário pelo userName
router.get("/user/:userName", profileController.getUserProfile);

// Rota para obter o perfil de um grupo pelo groupName
router.get("/group/:groupName", profileController.getGroupProfile);

export default router;