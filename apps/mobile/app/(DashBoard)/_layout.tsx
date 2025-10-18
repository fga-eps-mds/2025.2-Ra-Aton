import React from "react";
import { Text, View } from "react-native";
import { Tabs } from "expo-router";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../constants/Theme";
import {Fonts} from "../../constants/Fonts"
import {useFonts} from "expo-font"
import { error } from "console";

const DashboardLayout = () => {
  
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

    const [fontsLoaded, fontsError] = useFonts({
      [Fonts.primaryFont.dongleLight]: require('../../assets/fonts/Dongle-Light.ttf'),
      [Fonts.primaryFont.dongleBold]: require('../../assets/fonts/Dongle-Bold.ttf'),
      [Fonts.primaryFont.dongleRegular]: require('../../assets/fonts/Dongle-Regular.ttf')
    })
    if(!fontsLoaded && !fontsError){
      return null;
    }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.orange,
        tabBarInactiveTintColor: theme.text,
        tabBarStyle: {
          backgroundColor: theme.input,
          borderTopWidth: 2,
          borderTopColor: theme.orange,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    />
      
     
  );
};



export default DashboardLayout;
