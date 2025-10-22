import { Router } from "express";
import { auth } from "../middlewares/authMock";
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/usersController";

const router: Router = Router();

router.get("/", listUsers);
router.get("/:userName", getUser);
router.post("/", createUser);
router.put("/:userName", auth, updateUser);
router.delete("/:userName", auth, deleteUser);

export default router;
