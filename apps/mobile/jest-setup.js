// Minimal jest setup for mobile tests
// Place any global mocks or configuration here (e.g. native modules)

// Example: silence a warning or mock a native module
// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// define __DEV__ used by react-native
global.__DEV__ = true;

// define __fbBatchedBridgeConfig so react-native native modules initialization is bypassed in tests
global.__fbBatchedBridgeConfig = {};

// basic mocks for environment pieces react-native may expect
if (typeof TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// silence Animated native driver warning by mocking NativeAnimatedHelper
try {
  jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");
} catch (e) {
  // jest.mock may not be available in some environments of setup execution — ignore
}

module.exports = {};
