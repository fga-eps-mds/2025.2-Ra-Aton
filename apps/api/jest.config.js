// ./apps/api/jest.config.js

// Importa a configuração base da raiz
const baseConfig = require("../../jest.config.js");

/** @type {import('jest').Config} */
const config = {
  // Estende a configuração base
  ...baseConfig,

  // Preset específico para TypeScript com Node.js
  preset: "ts-jest",

  // Ambiente de teste deve ser 'node' para backend
  testEnvironment: "node",

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
};

module.exports = config;
