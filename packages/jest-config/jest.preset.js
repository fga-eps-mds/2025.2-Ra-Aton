const { pathsToModuleNameMapper } = require("ts-jest");
// Carrega os mapeamentos de paths do tsconfig base do monorepo
const { compilerOptions } = require("../../tsconfig.base.json");

module.exports = {
  // Limpa mocks e spies entre cada teste para garantir isolamento
  clearMocks: true,
  // Define o preset para transpilar TypeScript com ts-jest
  preset: "ts-jest",
  // Pastas a serem ignoradas durante a execução dos testes
  testPathIgnorePatterns: ["/node_modules/", "/.turbo/", "/dist/"],
  // Converte os aliases de importação do tsconfig (`@repo/*`) para um formato
  // que o Jest entende, essencial para testes em um monorepo.
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/../../",
  }),
};
