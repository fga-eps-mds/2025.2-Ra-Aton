import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react-native";
import { ThemeProvider } from "../constants/Theme"; // Ajuste o path se necessário

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

// Sobrescreve o método 'render' padrão
export { customRender as render };
