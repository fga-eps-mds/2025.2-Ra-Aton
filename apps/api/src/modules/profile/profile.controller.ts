import {Request, Response} from "express";
import profileService from "./profile.service";
import cloudinary from "../../config/cloudinary";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

class ProfileController {
  // Obtém o perfil de um usuário pelo userName
  async getUserProfile(req: Request, res: Response) {
    const { userName } = req.params;
    const authUserId = (req as any).user?.id;
    
    if (!userName) {
      return res.status(400).json({ message: "userName é obrigatório" });
    }
    
    try {
      const profileData = await profileService.fetchUserProfile(userName, authUserId);
      res.status(200).json(profileData);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Erro ao obter perfil do usuário" });
    }
  }

  // Obtém o perfil de um grupo pelo groupName
  async getGroupProfile(req: Request, res: Response) {
    const { groupName } = req.params;
    const authUserId = (req as any).user?.id;
    
    if (!groupName) {
      return res.status(400).json({ message: "groupName é obrigatório" });
    }
    
    try {
      const profileData = await profileService.fetchGroupProfile(groupName, authUserId);
      res.status(200).json(profileData);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Erro ao obter perfil do grupo" });
    }
  }

  // Atualiza imagens do grupo (logo e banner)
  async updateGroupImages(req: Request, res: Response) {
    const { groupId } = req.params;
    const authUserId = (req as any).user?.id;
    
    if (!groupId) {
      return res.status(400).json({ message: "groupId é obrigatório" });
    }

    if (!authUserId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const logoFile = files?.['logoImage']?.[0];
      const bannerFile = files?.['bannerImage']?.[0];

      const result = await profileService.updateGroupImages(
        groupId,
        authUserId,
        logoFile,
        bannerFile
      );

      res.status(200).json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Erro ao atualizar imagens do grupo" });
    }
  }
}

export default new ProfileController();