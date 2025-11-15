import { Router, type Router as RouterType } from "express";
import GroupJoinRequestController from "./groupJoinRequest.controller";
import validateRequest from "../../middlewares/validateRequest";
import { catchAsync } from "../../utils/catchAsync";
import {
  findInviteSchema,
  createInviteSchema,
  updateInviteSchema,
  deleteInviteSchema,
} from "./groupJoinRequest.validation";

const router: RouterType = Router();

router.get("/", catchAsync(GroupJoinRequestController.findAllInvites));

router.get(
  "/:id",
  validateRequest(findInviteSchema),
  catchAsync(GroupJoinRequestController.findInviteById),
);

router.get(
  "/:sender/group/:id",
  validateRequest(findInviteSchema),
  catchAsync(GroupJoinRequestController.findAllByGroupId),
);

router.get(
  "/:sender/user/:id",
  validateRequest(findInviteSchema),
  catchAsync(GroupJoinRequestController.findAllByUserId),
);

router.post(
  "/",
  validateRequest(createInviteSchema),
  catchAsync(GroupJoinRequestController.createInvite),
);

router.patch(
  "/:id",
  validateRequest(updateInviteSchema),
  catchAsync(GroupJoinRequestController.updateInvite),
);

router.delete(
  "/:id",
  validateRequest(deleteInviteSchema),
  catchAsync(GroupJoinRequestController.deleteInvite),
);

export default router;