import { Request, Response } from "express";
import HttpStatus from "http-status";
import { userService } from "../user/user.service";
import GroupService from "./group.service";

class GroupController {
  async listGroups(req: Request, res: Response) {
    const groups = await GroupService.getAllGroups()
    return res.status(HttpStatus.OK).json(groups);
  }
  async createGroup(req: Request, res: Response) {
    const authUser = (req as any).user;
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
    return res.status(HttpStatus.CREATED).json(newGroup)
  }
}

export default new GroupController();
