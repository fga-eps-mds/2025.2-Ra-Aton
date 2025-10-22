const base = require('@repo/jest-config');

module.exports = {
  displayName: 'api',
  // API uses ts-jest as its preset but inherits shared mappings and settings
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)', '<rootDir>/src/**/?(*.)+(spec|test).(ts|tsx|js)'],
  ...base,
};
