import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { globalErrorHandler } from "./middlewares/errorHandler";
import { ApiError } from "./utils/ApiError";
import userRoutes from "./modules/user/user.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import matchRoutes from "./modules/match/match.routes";
import HttpStatus from "http-status";
const app: Express = express();

// Middlewares Globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Configure as opções de CORS se necessário
app.use(helmet());

// Rota de Health Check
app.get("/", (_req: Request, res: Response) => {
  res.status(HttpStatus.OK).send({ status: "ok", service: "api" });
});

// --- MONTAGEM DAS ROTAS ---
// Use as novas rotas modulares
app.use("/users", userRoutes);
app.use("/login", authRoutes);
app.use("/match", matchRoutes);
// (Adicione outras rotas de módulos aqui, ex: /api/v1/posts, etc.)

// --- TRATAMENTO DE ERROS ---
// Middleware para rotas não encontradas (404)
app.use((req, res, next) => {
  next(new ApiError(HttpStatus.NOT_FOUND, "Rota não encontrada"));
});

// Middleware Global de Erros (DEVE SER O ÚLTIMO)
app.use(globalErrorHandler);

export default app;
