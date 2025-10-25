// app/_layout.tsx
import { ThemeProvider } from "../constants/Theme";
import { Stack } from "expo-router";
import {Fonts} from "../constants/Fonts"
import {useFonts} from "expo-font"


export default function RootLayout() {
 const [fontsLoaded, fontsError] = useFonts({
      [Fonts.primaryFont.dongleLight]: require('../assets/fonts/Dongle-Light.ttf'),
      [Fonts.primaryFont.dongleBold]: require('../assets/fonts/Dongle-Bold.ttf'),
      [Fonts.primaryFont.dongleRegular]: require('../assets/fonts/Dongle-Regular.ttf')
    })
    if(!fontsLoaded && !fontsError){
      return null;
    }

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}