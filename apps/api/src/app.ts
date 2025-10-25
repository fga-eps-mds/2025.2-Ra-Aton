import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import privateRoutes from "./routes/private.routes";
import userRoutes from "./routes/users";
import authRoutes from "./routes/auth.routes";

dotenv.config();
const app: express.Express = express();

app.use(cors());
app.use(express.json());

app.use("/private", privateRoutes);

app.use("/auth", authRoutes);

app.use("/users", userRoutes);

app.get("/", (_req, res) => {
  res.send({ status: "ok", service: "api" });
});

export default app;
