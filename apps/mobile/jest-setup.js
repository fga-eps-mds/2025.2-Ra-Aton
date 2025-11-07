// jest-setup.js — ORDEM IMPORTA!

// 1) Globais que o RN/Expo esperam (defina ANTES de qualquer require/mock)
globalThis.__DEV__ = true;
globalThis.__fbBatchedBridgeConfig = {};
process.env.EXPO_OS = process.env.EXPO_OS || "web";

// Early mocks for Expo native modules to avoid runtime native code in Jest
// These must run before any require() of expo modules.
try {
  // eslint-disable-next-line jest/no-jest-import
  const jestRequire = typeof jest !== "undefined" ? jest : require("jest-mock");

  jestRequire.mock("expo-modules-core", () => ({
    // some expo internals expect an eventEmitter function/object
    eventEmitter: () => ({ addListener: () => ({ remove: () => {} }) }),
    EventEmitter: class {
      addListener() {
        return { remove: () => {} };
      }
      removeAllListeners() {}
    },
    NativeModulesProxy: {},
  }));

  jestRequire.mock("expo-font", () => ({
    loadAsync: jestRequire.fn().mockResolvedValue(undefined),
    useFonts: () => [true, null],
  }));

  // Mock vector-icons to a simple functional component to avoid loading fonts
  jestRequire.mock("@expo/vector-icons", () => {
    const React = require("react");
    const MockIcon = (props) => React.createElement("span", props);
    // return any icon name as the same mock component
    return new Proxy({}, { get: () => MockIcon });
  });

  // Bare minimum mock for 'expo' package to avoid its runtime code
  jestRequire.mock("expo", () => ({}));
} catch (e) {
  // If jest isn't defined at this time, these mocks will be a no-op.
}
// Require centralized test mocks (shared, maintainable place)
try {
  require("./test/jest-mocks");
} catch (e) {
  /* ignore when running outside jest */
}
// 1.5 Mock top-level 'react-native' to provide Platform.OS, FlatList and basic components
// This prevents deeper RN internals from throwing in Jest (e.g., VirtualizedList reads Platform.OS).
try {
  jest.mock("react-native", () => {
    const React = require("react");

    const View = (props) => React.createElement("View", props, props.children);
    const Text = (props) => React.createElement("Text", props, props.children);
    const Image = (props) => React.createElement("Image", props);
    const TouchableOpacity = (props) =>
      React.createElement("TouchableOpacity", props, props.children);
    const TextInput = (props) => React.createElement("TextInput", props);
    const Pressable = (props) =>
      React.createElement("Pressable", props, props.children);
    const SafeAreaView = (props) =>
      React.createElement("View", props, props.children);
    const Modal = ({ visible, children }) =>
      visible ? React.createElement(React.Fragment, null, children) : null;

    // Simple FlatList mock: renders children by mapping data via renderItem
    const FlatList = ({
      data,
      renderItem,
      keyExtractor,
      ListEmptyComponent,
      style,
    }) => {
      if (!data || data.length === 0) {
        return ListEmptyComponent
          ? React.createElement(ListEmptyComponent)
          : null;
      }
      return React.createElement(
        "View",
        { style },
        data.map((item, index) =>
          React.createElement(
            "View",
            { key: keyExtractor ? keyExtractor(item) : String(index) },
            renderItem({ item, index }),
          ),
        ),
      );
    };

    return {
      Platform: {
        OS: "ios",
        select: (obj) => (obj && obj.ios) || obj?.default,
      },
      View,
      Text,
      Image,
      TouchableOpacity,
      TextInput,
      Pressable,
      SafeAreaView,
      FlatList,
      Modal,
      StyleSheet: {
        create: (s) => s,
        flatten: (s) => (Array.isArray(s) ? Object.assign({}, ...s) : s),
      },
      ActivityIndicator: (props) =>
        React.createElement("ActivityIndicator", props),
    };
  });
} catch {
  /* ignore if jest isn't available */
}
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
  select: (obj) =>
    obj && Object.prototype.hasOwnProperty.call(obj, "ios")
      ? obj.ios
      : obj?.default,
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
            window: {
              width: 393,
              height: 852,
              scale: 2,
              fontScale: 1,
              densityDpi: 320,
            },
            screen: {
              width: 393,
              height: 852,
              scale: 2,
              fontScale: 1,
              densityDpi: 320,
            },
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
jest.mock(
  "react-native/Libraries/Image/resolveAssetSource",
  () => (source) => source,
);

// 3.5 Mock NativeI18nManager used by Modal/I18nManager to provide getConstants()
// Some RN internals call NativeI18nManager.getConstants() during require()
try {
  jest.mock("react-native/Libraries/ReactNative/NativeI18nManager", () => ({
    getConstants: () => ({ isRTL: false }),
  }));
} catch {
  /* ignore if jest isn't available */
}

// 3.6 Mock Modal to avoid requiring native I18n/Platform internals in tests
// Render children only when `visible` is true. Keeps Modal semantics simple for tests.
try {
  jest.mock("react-native/Libraries/Modal/Modal", () => {
    const React = require("react");
    // Avoid requiring 'react-native' here to prevent circular requires during setup.
    // Use Fragment so we don't depend on platform components.
    const MockModal = ({ visible, children }) =>
      visible ? React.createElement(React.Fragment, null, children) : null;
    return MockModal;
  });
} catch {
  /* ignore if jest isn't available */
}

// 3.5 (Opcional) Silencia warning do Animated driver nativo
try {
  jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");
} catch {
  /* ignore */
}

// 3.6 NativeEventEmitter: evita avisos/erros de addListener/removeListeners
jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter", () => {
  const { EventEmitter } = require("events");
  return class MockNativeEventEmitter extends EventEmitter {
    addListener() {
      return { remove: () => {} };
    }
    removeListener() {}
    removeAllListeners() {}
  };
});

// (Opcional) export vazio — não é obrigatório em setup files
module.exports = {};
