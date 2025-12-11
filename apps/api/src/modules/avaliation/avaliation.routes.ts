import { Router, type Router as RouterType } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { catchAsync } from "../../utils/catchAsync";
import { auth } from "../../middlewares/auth";
import avaliationController from "./avaliation.controller";
import {
    findSchema,
    createSchema,
    updateSchema,
    deleteSchema
} from "./avaliation.validation"

const router: RouterType = Router();

router.get(
    "/",
    catchAsync(avaliationController.findAllAvals)
)

router.get(
    "/user",
    auth,
    catchAsync(avaliationController.findAllAvalsByUserId)
)

router.get(
    "/:id",
    validateRequest(findSchema),
    catchAsync(avaliationController.findAvalById)
)

router.post(
    "/",
    auth,
    validateRequest(createSchema),
    catchAsync(avaliationController.createAval)
)

router.patch(
    "/:id",
    validateRequest(updateSchema),
    catchAsync(avaliationController.updateAval)
)

router.delete(
    "/:id",
    validateRequest(deleteSchema),
    catchAsync(avaliationController.deleteAval)
)

export default router;