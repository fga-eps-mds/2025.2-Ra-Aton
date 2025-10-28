// app/_layout.tsx
import { ThemeProvider } from "@/constants/Theme";
import { Stack } from "expo-router";
import {Fonts} from "@/constants/Fonts"
import {useFonts} from "expo-font"
// import { UserProvider } from "@/libs/auth/userContext";

export default function RootLayout() {
  /* eslint-disable @typescript-eslint/no-require-imports */

 const [fontsLoaded, fontsError] = useFonts({
      [Fonts.primaryFont.dongleLight]: require('@/assets/fonts/Dongle-Light.ttf'),
      [Fonts.primaryFont.dongleBold]: require('@/assets/fonts/Dongle-Bold.ttf'),
      [Fonts.primaryFont.dongleRegular]: require('@/assets/fonts/Dongle-Regular.ttf')
    })
    /* eslint-enable @typescript-eslint/no-require-imports */

    if(!fontsLoaded && !fontsError){
      return null;
    }

  return (
    <ThemeProvider>
      {/* <UserProvider>  // Pra eu usar o context depois  */}  
        <Stack screenOptions={{ headerShown: false }} />
      {/* </UserProvider> */}
    </ThemeProvider>
  );
}
