#!/bin/bash
# Script para preparar o ambiente EAS Build
# Remove temporariamente dependências de workspace que o Yarn não consegue resolver

set -e

echo "🔧 Preparando ambiente para EAS Build..."

# Backup do package.json original
cp package.json package.json.backup

# Remove dependências de workspace do package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Remove workspace dependencies
if (pkg.devDependencies) {
  Object.keys(pkg.devDependencies).forEach(key => {
    if (pkg.devDependencies[key].startsWith('workspace:')) {
      delete pkg.devDependencies[key];
    }
  });
}

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

echo "📦 Instalando dependências com Yarn..."
COREPACK_ENABLE_STRICT=0 yarn install

# Restaura package.json original
mv package.json.backup package.json

echo "✅ yarn.lock gerado com sucesso!"
echo "ℹ️  package.json restaurado (workspace:* dependencies mantidas)"
echo ""
echo "🚀 Agora você pode rodar:"
echo "   eas build --profile development --platform android"
