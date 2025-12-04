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
  listMatchesSchema
} from "./match.validation";

const router: RouterType = Router();

router.get(
  "/",
  validateRequest(listMatchesSchema),
  catchAsync(matchController.listMatches),
);

router.get(
  "/:id",
  validateRequest(getMatchSchema),
  catchAsync(matchController.getMatch),
);

/*
 * GET match/author
 * Retorna todas as partidas que o usuário criou,
 * ou seja, todas as partidas onde "authorId" é 
 * igual ao id do usuário logado. 
 * 
 * Obs.: O id do usuário é pego automaticamente
 * pelo auth.  
*/

router.get(
  "/author",
  auth,
  catchAsync(matchController.listMatchesByUserId),
);

router.post(
  "/",
  auth,
  validateRequest(createMatchSchema),
  catchAsync(matchController.createMatch),
);

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

router.post(
  "/:id/subscribe",
  auth,
  validateRequest(getMatchSchema),
  catchAsync(matchController.subscribeToMatch),
);

router.delete(
  "/:id/unsubscribe",
  auth,
  validateRequest(getMatchSchema),
  catchAsync(matchController.unsubscribeFromMatch),
);

router.post(
  "/:id/switch",
  auth,
  validateRequest(getMatchSchema),
  catchAsync(matchController.switchTeam),
);

export default router;