import { Request, Response } from "express";
import { userService } from "./user.service";
import { ApiError } from "../../utils/ApiError";
import HttpStatus from "http-status";

class UserController {
  async listUsers(req: Request, res: Response) {
    const users = await userService.getAllUsers();
    res.status(HttpStatus.OK).json(users);
  }

  async getUser(req: Request, res: Response) {
    const { userName } = req.params;
    if (!userName) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: "O nome de usuário é obrigatório.",
      });
    }
    const user = await userService.getUserByUserName(userName);
    res.status(HttpStatus.OK).json(user);
  }

  async createUser(req: Request, res: Response) {
    const newUser = await userService.createUser(req.body);
    res.status(HttpStatus.CREATED).json(newUser);
  }

  async updateUser(req: Request, res: Response) {
    const { userName } = req.params;
    if (!userName) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: "O nome de usuário é obrigatório para atualização.",
      });
    }

    // O middleware 'auth' garante que req.user.id existe
    const authUserId = (req as any).user!.id;

    try {
      const updatedUser = await userService.updateUser(
        userName,
        authUserId,
        req.body,
      );
      return res.status(HttpStatus.OK).json(updatedUser);
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Erro ao atualizar usuário",
      });
    }
  }

  async deleteUser(req: Request, res: Response) {
    const { userName } = req.params;
    if (!userName) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: "O nome de usuário é obrigatório para exclusão.",
      });
    }

    // O middleware 'auth' garante que req.user.id existe
    const authUserId = (req as any).user!.id;

    try {
      await userService.deleteUser(userName, authUserId);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Erro ao deletar usuário",
      });
    }
  }
}

export default new UserController();
