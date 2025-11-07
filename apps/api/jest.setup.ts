// ./apps/api/jest.setup.js
// Este arquivo é essencial para mockar o Prisma

import { prismaMock } from "./src/__tests__/prisma-mock";

// Mocka o módulo do cliente Prisma.
// Substitua './src/lib/prisma' pelo caminho real onde você exporta sua instância do cliente Prisma.
// Este é um padrão comum (ex: export const prisma = new PrismaClient())
jest.mock("./src/database/prisma.client", () => ({
  __esModule: true,
  prisma: prismaMock, // Mapeia a exportação 'prisma' para o mock
}));

// Garante que os mocks sejam limpos antes de cada teste
beforeEach(() => {
  jest.clearAllMocks();
});
