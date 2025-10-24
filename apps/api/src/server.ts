import app from "./app";
import { prisma } from "./prisma";

// Validate required environment variables
if (!process.env.JWT_SECRET) {
	// eslint-disable-next-line no-console
	console.error('FATAL: missing environment variable JWT_SECRET')
	process.exit(1)
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const server = app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

const shutdown = async () => {
  // eslint-disable-next-line no-consoleeslint
  console.log("Shutting down server...");
  server.close(async () => {
    await prisma.$disconnect();

    console.log("Server shut down");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
