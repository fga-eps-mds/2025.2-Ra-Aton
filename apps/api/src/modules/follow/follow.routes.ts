import { Router } from 'express';
import followController from './follow.controller';
import { auth } from '../../middlewares/auth';

const router: Router = Router();

router.post('/groups/:id/follow', auth, followController.followGroup);

router.delete('/groups/:id/follow', auth, followController.unfollowGroup);

router.get('/users/:id/following-groups', followController.listUserFollowing);

export default router;