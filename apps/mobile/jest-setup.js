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
try {
  const jestRequire = typeof jest !== "undefined" ? jest : require("jest-mock");

  jestRequire.mock("expo-modules-core", () => {
    return {
      requireNativeModule: jestRequire.fn(() => ({})),
      requireOptionalNativeModule: jestRequire.fn(() => ({})),
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

  jestRequire.mock("expo-constants", () => ({
    __esModule: true,
    default: {
      expoConfig: {
        extra: {
          apiUrl: 'http://localhost:4000',
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
  
  jestRequire.mock("expo-router", () => ({
    useRouter: () => ({
      push: jestRequire.fn(),
      replace: jestRequire.fn(),
      back: jestRequire.fn(),
      setParams: jestRequire.fn(),
    }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb) => cb(),
    Link: ({ children }) => children,
    Stack: { Screen: () => null },
    Tabs: { Screen: () => null },
  }));
} catch (e) {}

// 4) Mock do Secure Store
try {
  const j = typeof jest !== "undefined" ? jest : require("jest-mock");
  j.mock("expo-secure-store", () => ({
    getItemAsync: j.fn(async () => null),
    setItemAsync: j.fn(async () => null),
    deleteItemAsync: j.fn(async () => null),
  }));
} catch (e) {}

// 5) Carrega mocks centralizados
try {
  require("./test/jest-mocks");
} catch (e) {}

// 6) Mock COMPLETO do React Native (Top Level)
// Removemos os mocks de "Libraries/..." que causavam erro
try {
  jest.mock("react-native", () => {
    const React = require("react");
    const EventEmitter = require("events").EventEmitter;

    const mockComponent = (name) => (props) => React.createElement(name, props, props.children);

    const View = mockComponent("View");
    const Text = mockComponent("Text");
    const Image = mockComponent("Image");
    const TouchableOpacity = mockComponent("TouchableOpacity");
    const TextInput = mockComponent("TextInput");
    const Pressable = mockComponent("Pressable");
    const SafeAreaView = mockComponent("View");
    const ScrollView = mockComponent("ScrollView");
    const KeyboardAvoidingView = mockComponent("KeyboardAvoidingView");
    const Switch = mockComponent("Switch");
    const ActivityIndicator = mockComponent("ActivityIndicator");

    const Modal = ({ visible, children }) => 
      visible ? React.createElement(React.Fragment, null, children) : null;

    // --- CORREÇÃO AQUI ---
    const FlatList = ({ data, renderItem, keyExtractor, ListEmptyComponent, style }) => {
      if (!data || data.length === 0) {
        if (!ListEmptyComponent) return null;
        // Se for um elemento React válido (ex: <Text />), retorna ele direto
        if (React.isValidElement(ListEmptyComponent)) {
          return ListEmptyComponent;
        }
        // Se for um componente (função/classe), cria o elemento
        return React.createElement(ListEmptyComponent);
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
    // ---------------------

    class MockNativeEventEmitter extends EventEmitter {
      constructor() { super(); }
      addListener() { return { remove: () => {} }; }
      removeListener() {}
      removeAllListeners() {}
    }

    return {
      Platform: {
        OS: "ios",
        select: (obj) => (obj && obj.ios) || obj?.default,
      },
      View, Text, Image, TouchableOpacity, TextInput, Pressable, SafeAreaView, 
      FlatList, Modal, ActivityIndicator, ScrollView, KeyboardAvoidingView, Switch,
      StyleSheet: {
        create: (s) => s,
        flatten: (s) => (Array.isArray(s) ? Object.assign({}, ...s) : s),
        absoluteFill: {},
      },
      Alert: { alert: jest.fn() },
      Animated: {
         View: View,
         Text: Text,
         Image: Image,
         createAnimatedComponent: (c) => c,
         timing: () => ({ start: (cb) => cb && cb() }),
         Value: class { constructor(v) { this.v = v; } interpolate() {} setValue() {} },
      },
      Easing: { linear: () => {} },
      NativeModules: {
        UIManager: { RCTView: {} },
        RNGestureHandlerModule: {
          attachGestureHandler: jest.fn(),
          createGestureHandler: jest.fn(),
          dropGestureHandler: jest.fn(),
          updateGestureHandler: jest.fn(),
          State: {},
          Directions: {},
        },
        PlatformConstants: { forceTouchAvailable: false },
      },
      NativeEventEmitter: MockNativeEventEmitter,
      DeviceEventEmitter: new MockNativeEventEmitter(),
    };
  });

  jest.mock('expo-constants', () => ({
    default: { expoConfig: { extra: {} }, manifest: {} },
  }));
} catch {}

// 7) Utilitários
if (typeof TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

global.alert = () => {};

module.exports = {};