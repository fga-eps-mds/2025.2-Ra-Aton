module.exports = {
  displayName: "mobile",
  preset: "jest-expo",

  transformIgnorePatterns: [
    "node_modules/(?!.*((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@expo-router|expo-router|expo-modules-core|expo-constants))",
  ],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(png|jpg|jpeg|gif|svg)$": "<rootDir>/__mocks__/fileMock.js",

    "^expo-constants$": "<rootDir>/__mocks__/expo-constants.js",
    "^expo-modules-core$": "<rootDir>/__mocks__/expo-modules-core.js",
    // ----------------------------------
  },

  setupFiles: ["<rootDir>/jest-setup.js"], // Mantém o setup para os outros mocks

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
    "!__tests__/**",
  ],
};
