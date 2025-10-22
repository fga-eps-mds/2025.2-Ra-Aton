module.exports = {
  root: true,
  extends: [
    // re-exported entry from packages/eslint-config
    '@repo/eslint-config/base'
  ],
  ignorePatterns: ['node_modules/', 'dist/', 'build/', 'packages/*/node_modules'],
};
