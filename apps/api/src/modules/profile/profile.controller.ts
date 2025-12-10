import {Request, Response} from "express";
import profileService from "./profile.service";

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
}

export default new ProfileController();