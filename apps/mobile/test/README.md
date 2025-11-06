Testing mocks

This folder centralizes test mocks for the `mobile` app. The setup aims to keep mocks:

- Centralized and easy to update
- Lightweight and safe for unit tests
- Loaded early by `jest-setup.js`

Files
- `jest-mocks.js`: main shared mock file. Put reusable `jest.mock(...)` calls here.
- `__mocks__/fileMock.js`: moduleNameMapper target for image assets (already at the project root under `apps/mobile/__mocks__`).

How it is loaded
`apps/mobile/jest-setup.js` requires `./test/jest-mocks` early during Jest setup. Add new global mocks to `jest-mocks.js` when they are shared across tests.

Guidelines
- Prefer module-level mocks (jest.mock) here for components and packages used in many tests.
- Keep mocks minimal and deterministic (avoid heavy logic).
- For component-specific or scenario-specific mocks, use `jest.mock` in the test file itself.
