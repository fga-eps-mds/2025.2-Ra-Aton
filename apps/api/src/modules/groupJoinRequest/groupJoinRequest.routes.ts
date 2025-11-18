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

/*
 *
 * /groupJoinRequest/:sender/group/:id
 * Retorna todos os pedidos de entrada em grupos feitos por ou para o grupo com o ID especificado.
 * Se quero ver todos os pedidos que eu (usuário autenticado) recebi para entrar em meu grupo, uso
 * /invite/:meuId/group/:meuGrupoId
 */

router.get(
  "/:sender/group/:id",
  validateRequest(findInviteSchema),
  catchAsync(GroupJoinRequestController.findAllByGroupId),
);

/*
 *
 * /groupJoinRequest/:sender/user/:id
 * Retorna todos os pedidos de entrada em grupos feitos por ou para o usuário com o ID especificado.
 * Se quero ver todos os pedidos que eu (usuário autenticado) fiz para entrar em grupos, uso
 * /invite/:meuId/user/:meuId
 */
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
