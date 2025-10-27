import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { globalErrorHandler } from "./middlewares/errorHandler";
import { ApiError } from "./utils/ApiError";
import userRoutes from "./modules/user/user.routes"; // <-- Importe as novas rotas
import { authRoutes } from "./modules/auth/auth.routes";
// NÃO IMPORTE MAIS:
// import oldUserRoutes from './routes/users';
// import { ... } from './controllers/userController';

const app: Express = express();

// Middlewares Globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Configure as opções de CORS se necessário
app.use(helmet());

// Rota de Health Check
app.get("/", (_req: Request, res: Response) => {
  res.status(200).send({ status: "ok", service: "api" });
});

// --- MONTAGEM DAS ROTAS ---
// Use as novas rotas modulares
app.use("/users", userRoutes);
app.use("/login", authRoutes);
// (Adicione outras rotas de módulos aqui, ex: /api/v1/posts, etc.)

// --- TRATAMENTO DE ERROS ---
// Middleware para rotas não encontradas (404)
app.use((req, res, next) => {
  next(new ApiError(404, "Rota não encontrada"));
});

// Middleware Global de Erros (DEVE SER O ÚLTIMO)
app.use(globalErrorHandler);

export default app;
