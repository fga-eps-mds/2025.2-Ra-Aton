import { Request, Response } from "express";
import HttpStatus from "http-status";
import { ApiError } from "../../utils/ApiError";
import groupMembershipService from "./groupMembership.service";

class GroupMembershipController {
  async listAllMembers(req: Request, res: Response) {
    const members = await groupMembershipService.findAllMembers();
    res.status(HttpStatus.OK).json(members);
  }

  async listAllMembersByUserId(req: Request, res: Response) {
    const { id: userId } = req.params;
    if (!userId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "ID do grupo é obrigatório" });
    }

    const members = await groupMembershipService.findMemberByUserId(userId);
    return res.status(HttpStatus.OK).json(members);
  }

  async listAllMembersFromGroupId(req: Request, res: Response) {
    const { id: gropuId } = req.params;
    if (!gropuId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "ID do grupo é obrigatório" });
    }

    const members = await groupMembershipService.findMemberByGroupId(gropuId);
    return res.status(HttpStatus.OK).json(members);
  }

  async findMemberById(req: Request, res: Response) {
    const id = req.params.id;
    if (!id) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "ID do convite é obrigatario" });
    }
    const member = await groupMembershipService.findMemberById(id);
    return res.status(HttpStatus.OK).json(member);
  }

  async createMembership(req: Request, res: Response) {
    const newMember = await groupMembershipService.createMembership(req.body);
    res.status(HttpStatus.CREATED).json(newMember);
  }

  async updateMember(req: Request, res: Response) {
    const id = req.params.id;
    if (!id) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "ID do membro é obrigatario" });
    }
    try {
      const updatedMember = await groupMembershipService.updateMembership(
        req.body,
        id,
      );
      return res.status(HttpStatus.OK).json(updatedMember);
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Erro ao atualizar membro" });
    }
  }

  async deleteMember(req: Request, res: Response) {
    const id = req.params.id;
    if (!id) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "ID do membro é obrigatario" });
    }
    try {
      await groupMembershipService.deleteMembership(id);
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Erro ao excluir membro" });
    }
  }
}

export default new GroupMembershipController();
