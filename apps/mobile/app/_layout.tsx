// app/_layout.tsx
import { ThemeProvider } from "@/constants/Theme";
import { Stack } from "expo-router";
import { Fonts } from "@/constants/Fonts";
import { useFonts } from "expo-font";
import { UserProvider } from "@/libs/storage/UserContext";
import { useNotifications } from "@/libs/notifications/useNotifications";
import { useEffect } from "react";

// ⬇️ importa o React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function AppContent() {
  const { expoPushToken, notification } = useNotifications();

  useEffect(() => {
    if (expoPushToken) {
      console.log('📱 Expo Push Token:', expoPushToken);
      // TODO: Enviar token para o backend
      // await api.post('/users/push-token', { token: expoPushToken });
    }
  }, [expoPushToken]);

  useEffect(() => {
    if (notification) {
      console.log('🔔 Notification received:', notification);
    }
  }, [notification]);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}

export default function RootLayout() {
  /* eslint-disable @typescript-eslint/no-require-imports */

  const [fontsLoaded, fontsError] = useFonts({
    [Fonts.mainFont
      .dongleRegular]: require("@/assets/fonts/Dongle-Regular.ttf"),
    [Fonts.otherFonts.dongleBold]: require("@/assets/fonts/Dongle-Bold.ttf"),
    [Fonts.otherFonts.dongleLight]: require("@/assets/fonts/Dongle-Light.ttf"),
  });
  /* eslint-enable @typescript-eslint/no-require-imports */

  if (!fontsLoaded && !fontsError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
