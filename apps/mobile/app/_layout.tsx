// app/_layout.tsx
import { ThemeProvider } from "@/constants/Theme";
import { Stack } from "expo-router";
import { Fonts } from "@/constants/Fonts";
import { useFonts } from "expo-font";
import { UserProvider } from "@/libs/storage/UserContext";

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
    <ThemeProvider>
      <UserProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </UserProvider>
    </ThemeProvider>
  );
}
