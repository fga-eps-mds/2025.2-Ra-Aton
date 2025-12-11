import { Router } from "express";
import profileController from "./profile.controller";
import { auth } from "../../middlewares/auth";
import { upload } from "../../middlewares/uploadMiddleware";

const router: Router = Router();

// Rota para obter o perfil de um usuário pelo userName
router.get("/user/:userName",
    auth,
    profileController.getUserProfile);

// Rota para obter o perfil de um grupo pelo groupName
router.get("/group/:groupName",
    auth,
    profileController.getGroupProfile);

// Rota para atualizar imagens do grupo (logo e banner)
router.patch(
  "/group/:groupId/images",
  auth,
  upload.fields([
    { name: "logoImage", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]),
  profileController.updateGroupImages
);

export default router;