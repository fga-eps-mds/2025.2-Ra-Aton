import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";

const router: Router = Router();

router.get("/", authMiddleware, (req, res) => {
  res.json({ message: `Bem-vindo, usuário ${(req as any).user.id}!` });
});

export default router;
