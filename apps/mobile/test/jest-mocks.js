// Centralized Jest mocks for the mobile app tests
// Keep this file minimal and focused on high-level, stable mocks used across many tests.

// Note: This file is required from `jest-setup.js` which runs before any tests.

// Mock expo and related modules used by many components
try {
  // expo-modules-core
  jest.mock("expo-modules-core", () => ({
    eventEmitter: () => ({ addListener: () => ({ remove: () => {} }) }),
    EventEmitter: class {
      addListener() {
        return { remove: () => {} };
      }
      removeAllListeners() {}
    },
    NativeModulesProxy: {},
  }));

  // expo-font (some components call loadAsync or useFonts)
  jest.mock("expo-font", () => ({
    loadAsync: jest.fn().mockResolvedValue(undefined),
    useFonts: () => [true, null],
  }));

  // Bare minimum mock for 'expo'
  jest.mock("expo", () => ({}));
} catch (e) {
  // noop if jest not available
}

// Mock vector icons to a simple component to avoid loading fonts in tests
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const MockIcon = (props) => React.createElement("span", props);
  return new Proxy({}, { get: () => MockIcon });
});

// Mock react-native-safe-area-context to avoid installing native dependency in tests
jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  return {
    SafeAreaView: (props) => React.createElement("View", props, props.children),
    SafeAreaProvider: (props) =>
      React.createElement("View", props, props.children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// App-specific component mocks (shallow stubs that are safe for unit tests)
jest.mock("@/components/InputComp", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ label, value, onChangeText }) =>
      React.createElement("TextInput", {
        testID: label,
        accessibilityLabel: label,
        value,
        onChangeText,
      }),
  };
});

jest.mock("@/components/PrimaryButton", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ children, disabled, onPress }) =>
      React.createElement(
        "TouchableOpacity",
        { testID: "btn-create", accessible: true, onPress },
        React.createElement(
          "Text",
          null,
          String(children) + (disabled ? " (disabled)" : ""),
        ),
      ),
  };
});

jest.mock("@/components/SecondaryButton", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ children, onPress }) =>
      React.createElement(
        "TouchableOpacity",
        { testID: "btn-login", accessible: true, onPress },
        React.createElement("Text", null, String(children)),
      ),
  };
});

jest.mock("@/components/SpacerComp", () => {
  const React = require("react");
  return { __esModule: true, default: () => React.createElement("View", null) };
});

jest.mock("@/components/BackGroundComp", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ children, style, ...props }) =>
      React.createElement("View", { style, ...props }, children),
  };
});

// Provide a basic theme mock used across components
jest.mock("@/constants/Theme", () => ({
  // Provide both the hook and a ThemeProvider so tests using either import work.
  __esModule: true,
  useTheme: () => ({ isDarkMode: false, toggleDarkMode: () => {} }),
  ThemeProvider: ({ children }) => {
    const React = require("react");
    return React.createElement("View", null, children);
  },
}));

// Global helpers
global.alert = () => {};
