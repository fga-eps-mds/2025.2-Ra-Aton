const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..', '..');

const config = getDefaultConfig(projectRoot);

// 1. Configuração do Monorepo
// Adiciona a raiz do workspace para o Metro vigiar
config.watchFolders = [workspaceRoot];

// Adiciona os caminhos dos node_modules (importante para pnpm)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];


// 2. Configuração do SVG e Alias
const { transformer, resolver } = config;

// Transformer: ok substituir o objeto
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

// Resolver: AQUI ESTAVA O ERRO. 
// Não substitua o objeto config.resolver inteiro. Modifique as listas dentro dele.

config.resolver.assetExts = resolver.assetExts.filter((ext) => ext !== "svg");
config.resolver.sourceExts = [...resolver.sourceExts, "svg"];

// Configuração do Alias (@)
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@': path.resolve(projectRoot, '.'),
};

module.exports = config;