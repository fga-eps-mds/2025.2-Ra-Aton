// jest-setup.js — ORDEM IMPORTA!

// 1) Globais que o RN/Expo esperam (defina ANTES de qualquer require/mock)
globalThis.__DEV__ = true;
globalThis.__fbBatchedBridgeConfig = {};
process.env.EXPO_OS = process.env.EXPO_OS || "web";

// 2) Utilitários que algumas libs usam
if (typeof TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// 3) Mocks críticos usados muito cedo pelo RN

// 3.1 Platform: alguns módulos internos consultam Platform.OS/select logo no require
jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  OS: "ios",
  isTV: false,
  isTesting: true,
  // select({ ios, android, default }) -> prioriza ios se existir
  select: (obj) => (obj && Object.prototype.hasOwnProperty.call(obj, "ios") ? obj.ios : obj?.default),
}));

// 3.2 UIManager: evita acessos nativos quando Text/View são requeridos
jest.mock("react-native/Libraries/ReactNative/UIManager", () => ({
  RCTView: {},
  getViewManagerConfig: () => ({}),
  hasViewManagerConfig: () => false,
}));

// 3.3 TurboModuleRegistry: prove módulos nativos que o RN consulta no boot
jest.mock("react-native/Libraries/TurboModule/TurboModuleRegistry", () => {
  const create = (name) => {
    if (name === "SourceCode") {
      // Usado por resolveAssetSource e afins
      return { scriptURL: "http://localhost" };
    }
    if (name === "ReactNativeFeatureFlags") {
      // Flags internas do RN; vazio é suficiente
      return {};
    }
    if (name === "DeviceInfo") {
      // Usado por Dimensions/PixelRatio via getConstants()
      return {
        getConstants: () => ({
          isTesting: true,
          reactNativeVersion: { major: 0, minor: 0, patch: 0 },
          Dimensions: {
            window: { width: 393, height: 852, scale: 2, fontScale: 1, densityDpi: 320 },
            screen: { width: 393, height: 852, scale: 2, fontScale: 1, densityDpi: 320 },
          },
        }),
      };
    }
    return {};
  };
  return {
    get: create,
    getEnforcing: create,
  };
});

// 3.4 Evita que Image tente resolver assets nativamente
jest.mock("react-native/Libraries/Image/resolveAssetSource", () => (source) => source);

// 3.5 (Opcional) Silencia warning do Animated driver nativo
try {
  jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");
} catch { /* ignore */ }

// 4) Matchers do Testing Library (se você usa @testing-library/react-native)
try {
  require("@testing-library/jest-native/extend-expect");
} catch { /* ignore */ }

// 3.6 NativeEventEmitter: evita avisos/erros de addListener/removeListeners
jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter", () => {
  const { EventEmitter } = require("events");
  return class MockNativeEventEmitter extends EventEmitter {
    addListener() { return { remove: () => {} }; }
    removeListener() {}
    removeAllListeners() {}
  };
});


// (Opcional) export vazio — não é obrigatório em setup files
module.exports = {};
