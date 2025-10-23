const base = require('@repo/jest-config');

module.exports = {
  displayName: 'mobile',
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  // merge shared settings (paths mapping, clearMocks, etc.)
  ...base,
  // rely on jest-expo's transforms (Babel) for ts/tsx/jsx
  transformIgnorePatterns: [
    "node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg))"
  ],
  // keep mobile specific setup from package.json if needed
  setupFiles: ['<rootDir>/jest-setup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-native', '@testing-library/react-native'],
};
