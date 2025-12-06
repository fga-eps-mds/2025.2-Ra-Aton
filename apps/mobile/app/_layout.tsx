// app/_layout.tsx
// Importa polyfills PRIMEIRO, antes de qualquer outro import
import "../polyfills";

import { ThemeProvider } from "@/constants/Theme";
import { Stack } from "expo-router";
import { Fonts } from "@/constants/Fonts";
import { useFonts } from "expo-font";
import { UserProvider, useUser } from "@/libs/storage/UserContext";
import { useNotifications } from "@/libs/notifications/useNotifications";
import { useEffect } from "react";
import { syncPushToken } from "@/libs/notifications/syncPushToken";

// ⬇️ importa o React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ⬇️ importa o NotificationProvider
import { NotificationProvider } from "@/libs/storage/NotificationContext";

const queryClient = new QueryClient();

function AppContent() {
  const { expoPushToken, notification } = useNotifications();
  const { user } = useUser();

  // Sincroniza token quando usuário está logado e token de notificação disponível
  useEffect(() => {
    if (expoPushToken && user?.token) {
      console.log("📱 Sincronizando Expo Push Token com backend...");
      syncPushToken(expoPushToken, user.token);
    }
  }, [expoPushToken, user?.token]);

  useEffect(() => {
    if (notification) {
      console.log("🔔 Notification received:", notification);
    }
  }, [notification]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Rotas principais */}
      <Stack.Screen name="index" />
      <Stack.Screen name="(Auth)" />
      <Stack.Screen name="(DashBoard)" />
      <Stack.Screen name="perfilGrupo" options={{ presentation: 'card' }} />
    </Stack>
  );
}

export default function RootLayout() {
  /* eslint-disable @typescript-eslint/no-require-imports */

  const [fontsLoaded, fontsError] = useFonts({
    [Fonts.mainFont.dongleRegular]: require("@/assets/fonts/Dongle-Regular.ttf"),
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
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
