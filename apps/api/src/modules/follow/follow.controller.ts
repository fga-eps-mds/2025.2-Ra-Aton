import { Request, Response } from 'express';
import followService from './follow.service';
import httpStatus from 'http-status';
import GroupRepository from '../group/group.repository';

class FollowController {
    async followGroup(req: Request, res: Response) {
        const { name: groupName } = req.params;
        const { id: userId } = (req as any).user!;

        if (!groupName) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: 'Nome do grupo é necessário' });
        }

        const group = await GroupRepository.findGroupByName(groupName);
        if (!group) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'Grupo não encontrado' });
        }
        await followService.followGroup(userId, group.id);

        res.status(httpStatus.CREATED).json({ message: "Grupo seguido com sucesso" });
    }

    async unfollowGroup(req: Request, res: Response) {
        const { name: groupName } = req.params;
        const { id: userId } = (req as any).user!;

        if (!groupName) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: 'Nome do grupo é necessário' });
        }

        const group = await GroupRepository.findGroupByName(groupName);
        if (!group) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'Grupo não encontrado' });
        }

        await followService.unfollowGroup(userId, group.id);
        res.status(httpStatus.NO_CONTENT).send();
    }

    async listUserFollowing(req: Request, res: Response) {
        const { id: userId } = req.params;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        if (!userId) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: 'ID do usuário é necessário' });
        }

        const result = await followService.getUserFollowingGroups(userId, limit, page);
        res.status(httpStatus.OK).json(result);
    }
}

export default new FollowController();