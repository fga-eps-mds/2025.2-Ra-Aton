import { Router, type Router as RouterType } from "express";
import matchController from "./match.controller";
import validateRequest from "../../middlewares/validateRequest";
import { catchAsync } from "../../utils/catchAsync";
import { auth } from "../../middlewares/auth";
import {
  createMatchSchema,
  updateMatchSchema,
  deleteMatchSchema,
  getMatchSchema,
} from "./match.validation";

const router: RouterType = Router();

// ===================================
// Rotas Públicas (Não exigem token)
// ===================================

router.get("/", catchAsync(matchController.listAllMatchs));

router.get(
  "/:id",
  validateRequest(getMatchSchema),
  catchAsync(matchController.getMatch),
);

router.post(
  "/",
  auth,
  validateRequest(createMatchSchema),
  catchAsync(matchController.createMatch),
);

// ===================================
// Rotas Protegidas (Exigem token JWT)
// ===================================

router.patch(
  "/:id",
  auth,
  validateRequest(updateMatchSchema),
  catchAsync(matchController.updateMatch),
);

router.delete(
  "/:id",
  auth,
  validateRequest(deleteMatchSchema),
  catchAsync(matchController.deleteMatch),
);

export default router;
