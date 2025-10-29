// Este arquivo usa 'jest-mock-extended' para criar um mock profundo do Prisma
// Você precisará instalar: pnpm add -D jest-mock-extended -w

import { PrismaClient } from "@prisma/client";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";

// Tipagem para o nosso mock
export type DeepMockPrisma = DeepMockProxy<PrismaClient>;

// Cria e exporta o mock singleton
// O 'as unknown as DeepMockPrisma' é um truque de tipagem necessário
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockPrisma;
