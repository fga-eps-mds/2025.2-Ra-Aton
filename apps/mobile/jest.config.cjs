const base = require('@repo/jest-config');

module.exports = {
  displayName: 'mobile',

  // precisa pra Babel entender Expo/React Native
  preset: 'jest-expo',

  testEnvironment: 'jsdom',

  ...base,

  // não rodar testes dentro de app/ pq expo-router trata essa pasta como rotas reais
  testPathIgnorePatterns: ['<rootDir>/app/'],

  // importantíssimo pra pnpm + Windows
  transformIgnorePatterns: [],


  // mapeia imports com "@/" e assets tipo .png
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },

  setupFiles: ['<rootDir>/jest-setup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};
