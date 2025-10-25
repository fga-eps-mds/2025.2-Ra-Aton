// Compatibility shim: Jest expects a file named `jest-preset.js` or
// `jest-preset.json` at the package root when a package is used as a preset.
// Forward to the existing `jest.preset.js` file to avoid duplicating logic.
module.exports = require('./jest.preset.js');
