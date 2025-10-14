const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..', '..');

const config = getDefaultConfig(projectRoot);

// Add workspace root to watchFolders so metro can resolve packages in the monorepo
config.watchFolders = config.watchFolders || [];
if (!config.watchFolders.includes(workspaceRoot)) {
  config.watchFolders.push(workspaceRoot);
}

// Provide resolver extraNodeModules so imports from '@' resolve to ./app
config.resolver = config.resolver || {};
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@': path.resolve(projectRoot, '.'),
};

module.exports = config;
