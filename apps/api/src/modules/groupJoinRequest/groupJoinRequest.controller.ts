import { Request, Response } from "express";
import HttpStatus from "http-status";
import { ApiError } from "../../utils/ApiError";
import GroupJoinRequestService from "./groupJoinRequest.service";

class GroupJoinRequestController {
  async findAllInvites(req: Request, res: Response) {
    const invites = await GroupJoinRequestService.findAllInvites();
    res.status(HttpStatus.OK).json(invites);
  }

  async findAllByUserId(req: Request, res: Response) {
    const { sender, id: userId } = req.params;
    if (!userId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "ID do usuário é obrigatario" });
    }

    const normalizedSender = sender?.toUpperCase();

    const invites = await GroupJoinRequestService.findInviteByUserId(
      userId,
      normalizedSender,
    );
    return res.status(HttpStatus.OK).json(invites);
  }

  async findAllByGroupId(req: Request, res: Response) {
    const { sender, id: groupId } = req.params;
    if (!groupId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "ID do grupo é obrigatario" });
    }

    const normalizedSender = sender?.toUpperCase();

    const invites = await GroupJoinRequestService.findInviteByGroupId(
      groupId,
      normalizedSender,
    );
    return res.status(HttpStatus.OK).json(invites);
  }

  async findInviteById(req: Request, res: Response) {
    const inviteId = req.params.id;
    if (!inviteId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "ID do convite é obrigatario" });
    }
    const inviteFound = await GroupJoinRequestService.findInviteById(inviteId);
    return res.status(HttpStatus.OK).json(inviteFound);
  }

  async createInvite(req: Request, res: Response) {
    const newInvite = await GroupJoinRequestService.createInvite(req.body);
    res.status(HttpStatus.CREATED).json({ newInvite });
  }

  async updateInvite(req: Request, res: Response) {
    const inviteId = req.params.id;
    if (!inviteId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "ID do convite é obrigatario" });
    }
    try {
      const updateInvite = await GroupJoinRequestService.updateInvite(
        req.body,
        inviteId,
      );
      res.status(HttpStatus.OK).json({ updateInvite });
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Erro ao atualizar convite" });
    }
  }

  async deleteInvite(req: Request, res: Response) {
    const inviteId = req.params.id;
    if (!inviteId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "ID do convite é obrigatario" });
    }
    try {
      await GroupJoinRequestService.deleteInvite(inviteId);
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Erro ao excluir convite" });
    }
  }
}

export default new GroupJoinRequestController();
