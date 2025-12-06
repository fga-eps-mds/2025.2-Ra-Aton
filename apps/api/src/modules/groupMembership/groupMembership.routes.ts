import { Router, type Router as RouterType } from "express";
import GroupMembershipController from "./groupMembership.controller";
import validateRequest from "../../middlewares/validateRequest";
import { catchAsync } from "../../utils/catchAsync";
import {
  findMemberSchema,
  createMemberSchema,
  updateMemberSchema,
  deleteMemberSchema,
} from "./groupMembership.validate";

const router: RouterType = Router();

router.get("/", catchAsync(GroupMembershipController.listAllMembers));

router.get(
  "/:id",
  validateRequest(findMemberSchema),
  catchAsync(GroupMembershipController.findMemberById),
);

router.get(
  "/group/:id",
  validateRequest(findMemberSchema),
  catchAsync(GroupMembershipController.listAllMembersFromGroupId),
);

router.get(
  "/user/:id",
  validateRequest(findMemberSchema),
  catchAsync(GroupMembershipController.listAllMembersByUserId),
);

router.get(
  "/admin/:id",
  validateRequest(findMemberSchema),
  catchAsync(GroupMembershipController.listAllAdminMembersByUserId),
);

router.post(
  "/",
  validateRequest(createMemberSchema),
  catchAsync(GroupMembershipController.createMembership),
);

router.patch(
  "/:id",
  validateRequest(updateMemberSchema),
  catchAsync(GroupMembershipController.updateMember),
);

router.delete(
  "/:id",
  validateRequest(deleteMemberSchema),
  catchAsync(GroupMembershipController.deleteMember),
);

export default router;
