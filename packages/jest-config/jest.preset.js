const { pathsToModuleNameMapper } = require('ts-jest');

// Try to locate the monorepo TS base config (different projects use different paths).
// Common locations:
//  - ./tsconfig.base.json (repo root)
//  - ../typescript-config/base.json (packages/typescript-config)
//  - ../../packages/typescript-config/base.json
const tsconfigCandidates = [
  '../../tsconfig.base.json',
  '../typescript-config/base.json',
  '../../packages/typescript-config/base.json',
  '../packages/typescript-config/base.json',
];

let compilerOptions;
for (const candidate of tsconfigCandidates) {
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const conf = require(candidate);
    if (conf && conf.compilerOptions) {
      compilerOptions = conf.compilerOptions;
      break;
    }
  } catch (e) {
    // ignore and try next
  }
}

if (!compilerOptions) {
  throw new Error(
    'Cannot find TypeScript base config (tsconfig). Checked: ' + tsconfigCandidates.join(', ')
  );
}

module.exports = {
  // clear mocks between tests
  clearMocks: true,
  // ignore common build folders
  testPathIgnorePatterns: ['/node_modules/', '/.turbo/', '/dist/'],
  // map TS path aliases for Jest (projects will share same tsconfig paths)
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
    prefix: '<rootDir>/../../',
  }),
  
};
