const base = require("@repo/jest-config");

module.exports = {
  displayName: "mobile",
  preset: "jest-expo",
  testEnvironment: "node",

  ...base,

  // Habilita a coleta explicitamente
  collectCoverage: true,

  // Define quais arquivos devem ser monitorados.
  // O Jest vai varrer essas pastas procurando arquivos .ts/.tsx
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "libs/**/*.{ts,tsx}",
    "constants/**/*.{ts,tsx}",
    // Exclusões importantes (arquivos que não contém lógica ou são de configuração)
    "!app/**/_layout.tsx", // Arquivos de layout do Expo Router geralmente não se testa
    "!app/**/+html.tsx", // Arquivos de head html
    "!**/node_modules/**",
    "!**/babel.config.js",
    "!**/jest.setup.js",
    "!**/metro.config.js",
    "!**/*.d.ts", // Arquivos de definição de tipos
  ],
  // --------------------------

  // Mantém ignorando a execução de testes dentro de app (pois seus testes estão em __tests__)
  testPathIgnorePatterns: ["<rootDir>/app/", "<rootDir>/node_modules/"],

  transformIgnorePatterns: [
    // Dica: Se tiver problemas futuros com libs do expo, adicione aqui.
    // "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
  ],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(png|jpg|jpeg|gif|svg)$": "<rootDir>/__mocks__/fileMock.js",
  },

  setupFiles: ["<rootDir>/jest-setup.js"],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],

  // Arquivos que até podem rodar, mas não queremos que sujem a porcentagem de cobertura
  coveragePathIgnorePatterns: [
    "<rootDir>/test/", // Ignora a pasta test inteira (mocks, helpers)
    "<rootDir>/__mocks__/", // Ignora mocks manuais
    "<rootDir>/__tests__/", // Ignora os próprios arquivos de teste e helpers
    "<rootDir>/coverage/",
    "node_modules",
  ],
};
