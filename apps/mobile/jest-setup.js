// jest-setup.js — ORDEM IMPORTA!

// 1) AUMENTAR TIMEOUT GLOBAL (Essencial para CI)
// O padrão é 5000ms, o que falha frequentemente em ambientes de CI lentos (GitHub Actions)
if (typeof jest !== 'undefined') {
  jest.setTimeout(30000); // 30 segundos
}

// 2) Globais que o RN/Expo esperam
globalThis.__DEV__ = true;
globalThis.__fbBatchedBridgeConfig = {};
process.env.EXPO_OS = process.env.EXPO_OS || "web";

// 3) Mock Global do Expo Router (Evita falhas em componentes que importam Link/router)
try {
  const jestRequire = typeof jest !== "undefined" ? jest : require("jest-mock");
  jestRequire.mock("expo-router", () => ({
    useRouter: () => ({
      push: jestRequire.fn(),
      replace: jestRequire.fn(),
      back: jestRequire.fn(),
    }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb) => cb(), // Executa direto para não travar
    Link: ({ children }) => children,
    Stack: { Screen: () => null },
    Tabs: { Screen: () => null },
  }));
} catch (e) {
  // ignore
}

// 4) Early mocks for Expo native modules
try {
  const jestRequire = typeof jest !== "undefined" ? jest : require("jest-mock");

  jestRequire.mock("expo-modules-core", () => ({
    eventEmitter: () => ({ addListener: () => ({ remove: () => {} }) }),
    EventEmitter: class {
      addListener() { return { remove: () => {} }; }
      removeAllListeners() {}
    },
    NativeModulesProxy: {},
  }));

  jestRequire.mock("expo-font", () => ({
    loadAsync: jestRequire.fn().mockResolvedValue(undefined),
    useFonts: () => [true, null],
  }));

  jestRequire.mock("@expo/vector-icons", () => {
    const React = require("react");
    const MockIcon = (props) => React.createElement("span", props);
    return new Proxy({}, { get: () => MockIcon });
  });

  jestRequire.mock("expo", () => ({}));
} catch (e) {}

// 5) Ensure 'expo-secure-store' is mocked early
try {
  const j = typeof jest !== "undefined" ? jest : require("jest-mock");
  j.mock("expo-secure-store", () => ({
    getItemAsync: j.fn(async () => null),
    setItemAsync: j.fn(async () => null),
    deleteItemAsync: j.fn(async () => null),
  }));
} catch (e) {}

// 6) Require centralized test mocks
try {
  require("./test/jest-mocks");
} catch (e) {}

// 7) Mock top-level 'react-native'
// MANTIDO conforme seu arquivo original, mas saiba que isso fixa o OS em 'ios' por padrão
try {
  jest.mock("react-native", () => {
    const React = require("react");
    const View = (props) => React.createElement("View", props, props.children);
    const Text = (props) => React.createElement("Text", props, props.children);
    const Image = (props) => React.createElement("Image", props);
    const TouchableOpacity = (props) => React.createElement("TouchableOpacity", props, props.children);
    const TextInput = (props) => React.createElement("TextInput", props);
    const Pressable = (props) => React.createElement("Pressable", props, props.children);
    const SafeAreaView = (props) => React.createElement("View", props, props.children);
    const Modal = ({ visible, children }) => visible ? React.createElement(React.Fragment, null, children) : null;
    const ActivityIndicator = (props) => React.createElement("ActivityIndicator", props);

    const FlatList = ({ data, renderItem, keyExtractor, ListEmptyComponent, style }) => {
      if (!data || data.length === 0) {
        return ListEmptyComponent ? React.createElement(ListEmptyComponent) : null;
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
      View, Text, Image, TouchableOpacity, TextInput, Pressable, SafeAreaView, FlatList, Modal, ActivityIndicator,
      StyleSheet: {
        create: (s) => s,
        flatten: (s) => (Array.isArray(s) ? Object.assign({}, ...s) : s),
      },
      Alert: { alert: jest.fn() } // Adicionei mock básico do Alert
    };
  });

  jest.mock('expo-constants', () => ({
    default: {
      expoConfig: { extra: {} },
      manifest: {},
    },
  }));
} catch {}

// 8) Utilitários
if (typeof TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// 9) Mocks críticos do RN internals
jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  OS: "ios",
  isTV: false,
  isTesting: true,
  select: (obj) => obj && Object.prototype.hasOwnProperty.call(obj, "ios") ? obj.ios : obj?.default,
}));

jest.mock("react-native/Libraries/ReactNative/UIManager", () => ({
  RCTView: {},
  getViewManagerConfig: () => ({}),
  hasViewManagerConfig: () => false,
}));

jest.mock("react-native/Libraries/TurboModule/TurboModuleRegistry", () => {
  const create = (name) => {
    if (name === "SourceCode") return { scriptURL: "http://localhost" };
    if (name === "ReactNativeFeatureFlags") return {};
    if (name === "DeviceInfo") {
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
  return { get: create, getEnforcing: create };
});

jest.mock("react-native/Libraries/Image/resolveAssetSource", () => (source) => source);

try {
  jest.mock("react-native/Libraries/ReactNative/NativeI18nManager", () => ({
    getConstants: () => ({ isRTL: false }),
  }));
} catch {}

try {
  jest.mock("react-native/Libraries/Modal/Modal", () => {
    const React = require("react");
    const MockModal = ({ visible, children }) => visible ? React.createElement(React.Fragment, null, children) : null;
    return MockModal;
  });
} catch {}

try {
  jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");
} catch {}

jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter", () => {
  const { EventEmitter } = require("events");
  return class MockNativeEventEmitter extends EventEmitter {
    addListener() { return { remove: () => {} }; }
    removeListener() {}
    removeAllListeners() {}
  };
});

module.exports = {};