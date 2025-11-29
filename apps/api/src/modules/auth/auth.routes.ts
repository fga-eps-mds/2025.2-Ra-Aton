import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { loginSchema } from "./auth.validation";
import { catchAsync } from "../../utils/catchAsync";
import { authController } from "./auth.controller";

const router = Router();

router.post(
  "/",
  validateRequest(loginSchema),
  catchAsync(authController.login),
);

export const authRoutes: Router = router;
