import { Router, type Router as RouterType } from "express";
import GroupController from "./group.controller";
import validateRequest from "../../middlewares/validateRequest";
import { catchAsync } from "../../utils/catchAsync";
import { auth } from "../../middlewares/auth";

const router: RouterType = Router();

router.get("/", catchAsync(GroupController.listGroups));

router.post("/", auth, catchAsync(GroupController.createGroup));

export default router;
