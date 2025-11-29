// Este arquivo usa 'jest-mock-extended' para criar um mock profundo do Prisma
// Você precisará instalar: pnpm add -D jest-mock-extended -w

import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

// Tipagem para o nosso mock
export type DeepMockPrisma = DeepMockProxy<PrismaClient>;

// Cria e exporta o mock singleton
export const prismaMock: DeepMockPrisma = mockDeep<PrismaClient>();

// Garante que os mocks sejam limpos entre testes
beforeEach(() => {
  mockReset(prismaMock);
});
