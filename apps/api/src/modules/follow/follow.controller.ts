import { Request, Response } from 'express';
import followService from './follow.service';
import httpStatus from 'http-status';

class FollowController {
    async followGroup(req: Request, res: Response) {
        const { id: groupId } = req.params;
        const { id: userId } = (req as any).user;

        if (!groupId) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: 'ID do grupo é necessário' });
        }

        await followService.followGroup(userId, groupId);
        res.status(httpStatus.CREATED).json({ message: "Grupo seguido com sucesso" });
    }

    async unfollowGroup(req: Request, res: Response) {
        const { id: groupId } = req.params;
        const { id: userId } = (req as any).user;
        
        if (!groupId) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: 'ID do grupo é necessário' });
        }

        await followService.unfollowGroup(userId, groupId);
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