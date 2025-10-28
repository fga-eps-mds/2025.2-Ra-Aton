import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("react-native", () => {
  const React = require("react");
  const pass = (tag: any, mapProps?: (p: any) => any) => (props: any) =>
    React.createElement(tag, mapProps ? mapProps(props) : props, props.children);

  const StyleSheet = {
    create: (o: any) => o,
    flatten: (input: any): any => {
      if (!input) return input;
      if (Array.isArray(input)) {
        return input.reduce((acc, item) => Object.assign(acc, StyleSheet.flatten(item)), {});
      }
      if (typeof input === "number") return {};
      if (typeof input === "object") return input;
      return {};
    },
    compose: (a: any, b: any) => StyleSheet.flatten([a, b]),
  };

  return {
    View: pass("div"),
    Text: pass("span"),
    Image: pass("img"),

    ScrollView: pass("div", ({ contentContainerStyle, ...rest }: any) => rest),
    TouchableOpacity: pass("button"),
    StyleSheet,
  };
}, { virtual: true });

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/constants/Theme", () => ({
  useTheme: () => ({ isDarkMode: false, toggleDarkMode: jest.fn() }),
}));

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  return new Proxy({}, {
    get: () => (props: any) => React.createElement("span", null, props?.name || "icon"),
  });
});

jest.mock("@/components/PrimaryButton", () => {
  const React = require("react");
  return ({ children, onPress }: any) =>
    React.createElement("button", { onClick: onPress }, React.createElement("span", null, children));
});
jest.mock("@/components/SecondaryButton", () => {
  const React = require("react");
  return ({ children, onPress }: any) =>
    React.createElement("button", { onClick: onPress }, React.createElement("span", null, children));
});

jest.mock("@/components/SpacerComp", () => {
  const React = require("react");
  return () => React.createElement(React.Fragment, null);
});
jest.mock("@/components/BackGroundComp", () => {
  const React = require("react");
  return ({ children }: any) => React.createElement(React.Fragment, null, children);
});

jest.mock("@/assets/img/Logo_1_Atom.png", () => "LOGO_MOCK");

import FormsCadastro from "../../app/(Auth)/formsCadastro";

const origError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === "string" && args[0].includes("react-test-renderer is deprecated")) return;
    origError(...args);
  };
});
afterAll(() => { console.error = origError; });

describe("FormsCadastro - mínimo estável", () => {
  it("renderiza todos os textos esperados", () => {
    render(<FormsCadastro />);

    expect(screen.getByText(/Para finalizar o seu cadastro/i)).toBeTruthy();
    expect(screen.getByText(/Selecione seu perfil/i)).toBeTruthy();

    expect(screen.getByText(/Atlética/i)).toBeTruthy();
    expect(screen.getByText(/Jogador/i)).toBeTruthy();
    expect(screen.getByText(/Torcedor/i)).toBeTruthy();

    expect(screen.getByText(/Pular esta etapa/i)).toBeTruthy();
  });
});
