// app/_layout.tsx
import { ThemeProvider } from "../constants/Theme";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(DashBoard)" options={{ headerShown: false }} />
        {/* Optional: any other routes */}
      </Stack>
    </ThemeProvider>
  );
}
