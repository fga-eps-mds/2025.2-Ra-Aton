import { Request, Response } from "express";
import HttpStatus from "http-status";
import { userService } from "../user/user.service";
import GroupService from "./group.service";
import { ApiError } from "../../utils/ApiError";

class GroupController {
  async listGroups(req: Request, res: Response) {
    const groups = await GroupService.getAllGroups();
    return res.status(HttpStatus.OK).json(groups);
  }

  async listOpenGroups(req: Request, res: Response) {
    const groups = await GroupService.getAllOpenGroups();
    return res.status(HttpStatus.OK).json(groups);
  }

  async getGroupByName(req: Request, res: Response) {
    const groupName = req.params.name;
    if (!groupName) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: "Nome do grupo é obrigatorio" });
    }

    const authUser = (req as any).user!;
    const currentUserId =  authUser?.id;
    const groupFound = await GroupService.getGroupByName(groupName, currentUserId);
    return res.status(HttpStatus.FOUND).json(groupFound);
  }

  async createGroup(req: Request, res: Response) {
    const authUser = (req as any).user!;
    if (!authUser || !authUser.id) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "Não foi possivel autorizar o usuário" });
    }

    const author = await userService.getUserById(authUser.id);
    if (!author) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: "Autor da postagem não encotrado" });
    }

    const newGroup = await GroupService.createGroup(req.body, author);
    return res.status(HttpStatus.CREATED).json(newGroup);
  }

  async updateGroup(req: Request, res: Response) {
    const authUser = (req as any).user!;
    if (!authUser || !authUser.id) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "Não foi possivel autorizar o usuário" });
    }

    const groupName = req.params.name;
    if (!groupName) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: "Nome do grupo é obrigatorio" });
    }

    try {
      const updatedGroup = await GroupService.updateGroup(
        req.body,
        authUser.id,
        groupName,
      );
      return res.status(HttpStatus.OK).json(updatedGroup);
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "não foi possível atualizar o grupo" });
    }
  }

  async deleteGroup(req: Request, res: Response) {
    const authUser = (req as any).user!;
    if (!authUser || !authUser.id) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "Não foi possivel autorizar o usuário" });
    }

    const groupName = req.params.name;
    if (!groupName) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: "Nome do grupo é obrigatorio" });
    }

    try {
      await GroupService.deleteGroup(authUser.id, groupName);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "não foi possível excluir o grupo" });
    }
  }
}

export default new GroupController();
