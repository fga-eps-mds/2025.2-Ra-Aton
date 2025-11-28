import { Router } from 'express';
import followController from './follow.controller';
import { auth } from '../../middlewares/auth';

const router: Router = Router();

router.post('/groups/:name/follow', auth, followController.followGroup);

router.delete('/groups/:name/follow', auth, followController.unfollowGroup);

router.get('/users/:id/following-groups', followController.listUserFollowing);

export default router;