// ...existing code...
import React, { createContext, useContext, useMemo, useState } from "react";
import {
  useColorScheme as useSystemColorScheme,
  View,
  Text,
  Switch,
  StyleProp,
  ViewStyle,
  StyleSheet,
} from "react-native";
import { Colors } from "../constants/Colors";

type ThemeMode = "light" | "dark" | "system";
type ThemeContextType = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  colorScheme: "light" | "dark";
  theme: typeof Colors.light;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const system = useSystemColorScheme() === "light" ? "light" : "dark";
  const [mode, setMode] = useState<ThemeMode>("system");
  const colorScheme = mode === "system" ? system : mode;
  const theme = Colors[colorScheme];

  const value = useMemo(() => ({ mode, setMode, colorScheme, theme }), [mode, colorScheme, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within ThemeProvider");
  return ctx;
};

type ThemeToggleProps = {
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<ViewStyle>;
  showLabel?: boolean;
};

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ style, labelStyle, showLabel = true }) => {
  const { colorScheme, setMode, theme } = useAppTheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        {showLabel && <Text style={[{ color: theme.text, marginRight: 8 }, labelStyle]}>{isDark ? "Dark" : "Light"}</Text>}
        <Switch value={isDark} onValueChange={(v) => setMode(v ? "dark" : "light")} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "85%", alignItems: "flex-end", paddingTop: 16 },
  row: { flexDirection: "row", alignItems: "center" },
});
// ...existing code...