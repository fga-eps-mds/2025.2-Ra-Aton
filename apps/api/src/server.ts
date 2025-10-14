import app from './app';
import { prisma } from './prisma';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const server = app.listen(PORT, () => {
	// eslint-disable-next-line no-console
	console.log(`API listening on http://localhost:${PORT}`);
});

const shutdown = async () => {
	// eslint-disable-next-line no-console
	console.log('Shutting down server...');
	server.close(async () => {
		await prisma.$disconnect();
		// eslint-disable-next-line no-console
		console.log('Server shut down');
		process.exit(0);
	});
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
