#!/usr/bin/env node
// Remove workspace dependencies que não são necessárias no EAS Build
const fs = require('fs');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Remove workspace:* dependencies
if (packageJson.devDependencies) {
  Object.keys(packageJson.devDependencies).forEach(key => {
    if (packageJson.devDependencies[key].startsWith('workspace:')) {
      console.log(`Removing workspace dependency: ${key}`);
      delete packageJson.devDependencies[key];
    }
  });
}

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Workspace dependencies removed successfully');
