//ARQUIVO: apps/mobile/app/_layout.tsx
import { ThemeProvider } from "@/constants/Theme";
import { Stack } from "expo-router";
import { Fonts } from "@/constants/Fonts";
import { useFonts } from "expo-font";
import { UserProvider } from "@/libs/storage/UserContext";

// ⬇️ importa o React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ⬇️ importa o NotificationProvider
import { NotificationProvider } from "@/libs/storage/NotificationContext";

const queryClient = new QueryClient();

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
          {/* A Stack deve envolver TUDO o que é navegação */}
          <Stack
            screenOptions={{
              headerShown: false, // Padrão: sem header
            }}
          >
            {/* Rotas principais */}
            <Stack.Screen name="index" />
            <Stack.Screen name="(Auth)" />
            <Stack.Screen name="(DashBoard)" />
            <Stack.Screen name="perfilGrupo" options={{ presentation: 'card' }} />
          </Stack>
          <NotificationProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </NotificationProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
