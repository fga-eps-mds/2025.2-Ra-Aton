import { Router, type Router as RouterType } from "express";
import userController from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import { catchAsync } from "../../utils/catchAsync";
import { auth } from "../../middlewares/auth"; // <-- Importando o middleware de autenticação
import {
  createUserSchema,
  getUserSchema,
  updateUserSchema,
  deleteUserSchema,
} from "./user.validation";

const router: RouterType = Router();

// ===================================
// Rotas Públicas (Não exigem token)
// ===================================

/**
 * GET /api/v1/users
 * Lista todos os usuários.
 */
router.get("/", catchAsync(userController.listUsers));

/**
 * POST /api/v1/users
 * Cria um novo usuário.
 */
router.post(
  "/",
  validateRequest(createUserSchema), // Valida o body
  catchAsync(userController.createUser),
);

/**
 * GET /api/v1/users/:userName
 * Busca um usuário específico pelo username.
 */
router.get(
  "/:userName",
  validateRequest(getUserSchema), // Valida o :userName nos params
  catchAsync(userController.getUser),
);

// ===================================
// Rotas Protegidas (Exigem token JWT)
// ===================================

/**
 * PATCH /api/v1/users/:userName
 * Atualiza o usuário. Requer autenticação.
 */
router.patch(
  "/:userName",
  auth, // 1. Executa o middleware de autenticação
  validateRequest(updateUserSchema), // 2. Valida o body e os params
  catchAsync(userController.updateUser), // 3. Executa o controller
);

/**
 * DELETE /api/v1/users/:userName
 * Deleta o usuário. Requer autenticação.
 */
router.delete(
  "/:userName",
  auth, // 1. Executa o middleware de autenticação
  validateRequest(deleteUserSchema), // 2. Valida os params
  catchAsync(userController.deleteUser), // 3. Executa o controller
);

export default router;
