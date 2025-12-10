module.exports = {
  displayName: "mobile",
  preset: "jest-expo",

  // --- A CORREÇÃO PARA O PNPM ---
  // Adicionamos '.*' antes dos nomes das bibliotecas.
  // Isso diz: "Não ignore node_modules se, em qualquer lugar do caminho, tiver react-native, expo, etc"
  transformIgnorePatterns: [
    "node_modules/(?!.*((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@expo-router|expo-router|expo-modules-core|expo-constants))"
  ],
  // -----------------------------

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(png|jpg|jpeg|gif|svg)$": "<rootDir>/__mocks__/fileMock.js"
  },

  // Verifica se você tem um arquivo de setup. 
  // Se não tiver 'jest-setup.js' na raiz, comente a linha abaixo ou aponte para 'test/jest-mocks.js' se for o caso.
  setupFiles: ["<rootDir>/test/jest-mocks.js"], 

  collectCoverage: true,
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "libs/**/*.{ts,tsx}",
    "!app/**/_layout.tsx",
    "!app/**/+html.tsx",
    "!**/node_modules/**",
    "!**/babel.config.js",
    "!**/jest.setup.js",
    "!**/metro.config.js",
    "!**/*.d.ts",
    "!test/**",
    "!__tests__/**"
  ],
};