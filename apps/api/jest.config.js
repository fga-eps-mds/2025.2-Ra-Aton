// ./apps/api/jest.config.js

/** @type {import('jest').Config} */
const config = {
  // Preset específico para TypeScript com Node.js
  preset: "ts-jest",

  // Ambiente de teste deve ser 'node' para backend
  testEnvironment: "node",

  // Carrega mocks de ambiente ANTES de carregar os testes/módulos
  setupFiles: ["<rootDir>/src/__tests__/env-mock.ts"],

  // Arquivo de setup para executar antes de cada suíte de teste
  // Usaremos isso para mockar o Prisma Client
  setupFilesAfterEnv: ["./jest.setup.ts"],

  // Informa ao Jest onde encontrar os arquivos de teste
  testMatch: ["<rootDir>/src/__tests__/**/*.test.ts"],

  // Ignora o diretório de build
  testPathIgnorePatterns: ["<rootDir>/dist/"],

  // Mapeia aliases de caminho do TypeScript (se você os usar)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Cobertura focada apenas neste pacote
  collectCoverageFrom: [
    "<rootDir>/src/**/*.{ts,tsx,js,jsx}",
    "!<rootDir>/src/**/index.{ts,tsx,js,jsx}",
    "!<rootDir>/src/**/*.config.{ts,js}",
  ],
  coverageDirectory: "<rootDir>/coverage",

  coverageReporters: ["html"],
};

module.exports = config;
