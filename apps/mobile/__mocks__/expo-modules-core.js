// apps/mobile/__mocks__/expo-modules-core.js
module.exports = {
  requireNativeModule: jest.fn(() => ({})),
  requireOptionalNativeModule: jest.fn(() => ({})),
  eventEmitter: () => ({ addListener: () => ({ remove: () => {} }) }),
  EventEmitter: class {
    addListener() { return { remove: () => {} }; }
    removeAllListeners() {}
    emit() {}
  },
  NativeModulesProxy: {},
  ProxyNativeModule: {},
};