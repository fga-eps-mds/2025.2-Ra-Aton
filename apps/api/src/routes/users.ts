import { Router } from 'express';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/usersController';
import { authUser } from '../auth/auth.routes'
const router: Router = Router();

router.get('/', listUsers); // SELECT *
router.get('/:id', getUser); // SELECT * WHERE ID='ID ESPECIFICADO'
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
