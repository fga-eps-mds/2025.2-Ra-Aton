// jest-setup.js — ORDEM IMPORTA!

// 1) AUMENTAR TIMEOUT GLOBAL (Essencial para CI lento)
if (typeof jest !== 'undefined') {
  jest.setTimeout(30000); // 30 segundos
}

// 2) Globais que o RN/Expo esperam
globalThis.__DEV__ = true;
globalThis.__fbBatchedBridgeConfig = {};
process.env.EXPO_OS = process.env.EXPO_OS || "web";

// 3) MOCKS DE INFRAESTRUTURA (Expo Modules Core & Constants)
// Estes precisam vir ANTES de qualquer outra coisa para evitar o erro "requireOptionalNativeModule"
try {
  const jestRequire = typeof jest !== "undefined" ? jest : require("jest-mock");

  // --- MOCK CRÍTICO CORRIGIDO ---
  jestRequire.mock("expo-modules-core", () => {
    const React = require("react");
    return {
      requireNativeModule: jestRequire.fn(() => ({})),
      requireOptionalNativeModule: jestRequire.fn(() => ({})), // <--- A CORREÇÃO DO ERRO
      eventEmitter: () => ({ addListener: () => ({ remove: () => {} }) }),
      EventEmitter: class {
        addListener() { return { remove: () => {} }; }
        removeAllListeners() {}
        emit() {}
      },
      NativeModulesProxy: {},
      ProxyNativeModule: {},
    };
  });

  // Mock do Expo Constants (usado no env.ts)
  jestRequire.mock("expo-constants", () => ({
    __esModule: true,
    default: {
      expoConfig: {
        extra: {
          apiUrl: 'http://localhost:4000', // Valor dummy para testes
        },
      },
      manifest: {},
      appOwnership: 'expo',
      deviceName: 'Jest',
    },
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
  
  // Mock do Expo Router Global
  jestRequire.mock("expo-router", () => ({
    useRouter: () => ({
      push: jestRequire.fn(),
      replace: jestRequire.fn(),
      back: jestRequire.fn(),
      setParams: jestRequire.fn(),
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

// 4) Mock do Secure Store
try {
  const j = typeof jest !== "undefined" ? jest : require("jest-mock");
  j.mock("expo-secure-store", () => ({
    getItemAsync: j.fn(async () => null),
    setItemAsync: j.fn(async () => null),
    deleteItemAsync: j.fn(async () => null),
  }));
} catch (e) {}

// 5) Carrega mocks centralizados (se existirem)
try {
  require("./test/jest-mocks");
} catch (e) {}

// 6) Mock do React Native (Top Level)
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

    // Mock simples de FlatList
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
        OS: "ios", // Default para iOS, mas testes específicos podem usar jest.doMock
        select: (obj) => (obj && obj.ios) || obj?.default,
      },
      View, Text, Image, TouchableOpacity, TextInput, Pressable, SafeAreaView, FlatList, Modal, ActivityIndicator,
      StyleSheet: {
        create: (s) => s,
        flatten: (s) => (Array.isArray(s) ? Object.assign({}, ...s) : s),
      },
      Alert: { alert: jest.fn() },
      Animated: {
         View: View,
         Text: Text,
         createAnimatedComponent: (c) => c,
         timing: () => ({ start: (cb) => cb && cb() }),
      }
    };
  });
} catch {}

// 7) Utilitários Globais
if (typeof TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

global.alert = () => {};

// 8) Mocks Críticos Internos do RN
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
    return ({ visible, children }) => visible ? React.createElement(React.Fragment, null, children) : null;
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