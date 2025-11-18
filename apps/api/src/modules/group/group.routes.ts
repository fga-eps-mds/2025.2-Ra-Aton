import { Router, type Router as RouterType } from "express";
import GroupController from "./group.controller";
import validateRequest from "../../middlewares/validateRequest";
import { catchAsync } from "../../utils/catchAsync";
import { auth } from "../../middlewares/auth";
import {
  getGroupSchema,
  createGroupSchema,
  updateGroupSchema,
  deleteGroupSchema,
} from "./group.validation";

const router: RouterType = Router();

// ===================================
// Rotas Públicas (Não exigem token)
// ===================================

router.get("/", catchAsync(GroupController.listGroups));

router.get("/open", catchAsync(GroupController.listOpenGroups))

router.get(
  "/:name",
  validateRequest(getGroupSchema),
  catchAsync(GroupController.getGroupByName),
);

// ===================================
// Rotas Protegidas (Exigem token JWT)
// ===================================

router.post(
  "/",
  auth,
  validateRequest(createGroupSchema),
  catchAsync(GroupController.createGroup),
);

router.patch(
  "/:name",
  auth,
  validateRequest(updateGroupSchema),
  catchAsync(GroupController.updateGroup),
);

router.delete(
  "/:name",
  auth,
  validateRequest(deleteGroupSchema),
  catchAsync(GroupController.deleteGroup),
);

export default router;
