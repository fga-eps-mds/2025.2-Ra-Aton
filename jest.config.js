// ./jest.config.js (Na raiz do seu monorepo)

/** @type {import('jest').Config} */
const config = {
  // Define o provedor de cobertura como 'babel' para melhor suporte a TS/JS transpilação
  coverageProvider: "babel",

  // Diretório onde os relatórios de cobertura agregados serão salvos quando executar na raiz
  coverageDirectory: "<rootDir>/coverage",

  // Módulos que os testes podem assistir
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],

  // Importante para monorepo: declare os projetos para que o Jest (e a extensão do VS Code)
  // consiga resolver o preset/transform corretos por pasta. Ao declarar diretórios,
  // o Jest irá usar automaticamente o "jest.config.js" de cada app.
  projects: [
    "<rootDir>/apps/api",
    "<rootDir>/apps/mobile",
  ],
  // NÃO defina 'preset', 'testEnvironment' ou 'transform' aqui.
  // Isso será feito em cada configuração de workspace.
};

module.exports = config;
