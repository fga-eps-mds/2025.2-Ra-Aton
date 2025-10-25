jest.mock("react-native", () => {
  const React = require("react");
  return {
    Text: (props: any) => React.createElement("Text", props),
    View: (props: any) => React.createElement("View", props),
    ScrollView: (props: any) => React.createElement("ScrollView", props),
    Image: (props: any) => React.createElement("Image", props),
    TouchableOpacity: (props: any) =>
      React.createElement("TouchableOpacity", props),
    TextInput: (props: any) => React.createElement("TextInput", props),
    StyleSheet: {
      create: (s: any) => s,
      flatten: (s: any) => (Array.isArray(s) ? Object.assign({}, ...s) : s),
    },
    Platform: { OS: "web" },
  };
});

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  return { Ionicons: (props: any) => React.createElement("Ionicons", props) };
});

jest.mock("expo-router", () => ({ useRouter: () => ({ push: jest.fn() }) }));

jest.mock("../components/InputComp", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ label, value, onChangeText }: any) =>
      React.createElement("TextInput", { testID: label, value, onChangeText }),
  };
});

jest.mock("../components/Button1Comp", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ children, disabled, onPress }: any) =>
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

jest.mock("../components/Button2Comp", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ children, onPress }: any) =>
      React.createElement(
        "TouchableOpacity",
        { testID: "btn-login", accessible: true, onPress },
        React.createElement("Text", null, String(children)),
      ),
  };
});

jest.mock("../components/SpacerComp", () => {
  const React = require("react");
  return { __esModule: true, default: () => React.createElement("View", null) };
});

jest.mock("../components/ThemedView", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ children }: any) => React.createElement("View", null, children),
  };
});

jest.mock("../constants/Theme", () => ({
  useTheme: () => ({ isDarkMode: false, toggleDarkMode: () => {} }),
}));

global.alert = () => {};
