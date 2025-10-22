import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import usersRouter from "./routes/users";

const app: express.Express = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.get("/", (_req, res) => res.send({ status: "ok", service: "api" }));
app.use("/users", usersRouter);

export default app;
