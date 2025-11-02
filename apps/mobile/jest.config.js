// ./apps/expo-app/jest.config.js

/** @type {import('jest').Config} */
const config = {
  // O 'preset' do jest-expo é MÁGICO.
  // Ele configura automaticamente o 'babel-jest', o ambiente do React Native,
  // e o mais importante: 'transformIgnorePatterns' para compilar
  // módulos de node_modules (algo que o Expo e o React Native exigem).
  preset: "jest-expo",

  // O jest-expo já define o ambiente de teste, mas 'node' é o correto
  // (testes de RN rodam em um ambiente Node, não JSDOM)
  testEnvironment: "node",

  // Setup básico para RN/Expo
  setupFiles: ["<rootDir>/jest-setup.js"],

  // Padrão para encontrar arquivos de teste
  testMatch: ["<rootDir>/**/*.test.(js|jsx|ts|tsx)"],

  // Informa ao Jest para transformar esses módulos
  // O preset 'jest-expo' geralmente cuida disso, mas é bom saber
  // transformIgnorePatterns: [
  //   'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo-.*|@expo-.*|@unimodules-.*|unimodules-.*|sentry-expo|native-base|@sentry/.*))',
  // ],
};

module.exports = config;
