import { start } from "repl";
import app from "./app";
import { config } from "./config/env";
import { startAllSchedulers } from "./schedulers";

// Validate required environment variables
if (!config.JWT_SECRET) {
  console.error("FATAL: missing environment variable JWT_SECRET");
  process.exit(1);
}

const PORT = config.PORT ? Number(config.PORT) : 4000;

const server = app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);

  startAllSchedulers();
});
