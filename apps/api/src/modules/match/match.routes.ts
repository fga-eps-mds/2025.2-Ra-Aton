import { Router } from "express";
import matchController from "./match.controller";
import validateRequest from "../../middlewares/validateRequest";
import { catchAsync } from "../../utils/catchAsync";
import { getMatchSchema } from "./match.validation";
import { auth } from "../../middlewares/auth";

const router: Router = Router();

router.get("/", catchAsync(matchController.listMatches));

router.get(
  "/:id",
  validateRequest(getMatchSchema),
  catchAsync(matchController.getMatch),
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
