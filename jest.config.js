// ./jest.config.js (Na raiz do seu monorepo)

/** @type {import('jest').Config} */
const config = {
  // Define o provedor de cobertura como 'babel' para melhor suporte a TS/JS transpilação
  coverageProvider: "babel",

  // Diretório onde os relatórios de cobertura serão salvos
  coverageDirectory: "<rootDir>/coverage",

  // Padrões para coletar cobertura. Inclui src, exclui index, configs, etc.
  collectCoverageFrom: [
    "<rootDir>/apps/*/src/**/*.{js,jsx,ts,tsx}",
    "!<rootDir>/**/index.{js,jsx,ts,tsx}",
    "!<rootDir>/**/*.config.{js,ts}",
    "!<rootDir>/**/.*rc.{js,ts}",
  ],

  // Módulos que os testes podem assistir
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],

  // NÃO defina 'preset', 'testEnvironment' ou 'transform' aqui.
  // Isso será feito em cada configuração de workspace.
};

module.exports = config;
