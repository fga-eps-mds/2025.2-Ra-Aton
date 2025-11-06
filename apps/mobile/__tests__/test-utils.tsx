import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react-native";
// Prefer mockable alias import so jest mocks (test/jest-mocks.js) are applied reliably
import { ThemeProvider } from "@/constants/Theme";

/**
 * Wrapper que provê o Tema para os componentes em teste.
 */
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};

/**
 * Função 'render' customizada que já inclui o ThemeProvider.
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-exporta tudo do testing-library
export * from "@testing-library/react-native";

describe("test-utils", () => {
  it("Just a placeholder test to ensure this file is recognized as a module", () => {
    expect(true).toBe(true);
  });
});

// Sobrescreve o método 'render' padrão
export { customRender as render };
