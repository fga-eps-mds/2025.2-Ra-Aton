import React from "react";
import { Text, View } from "react-native";
import { Tabs } from "expo-router";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../constants/Theme";
import { Fonts } from "../../constants/Fonts";
import { useFonts } from "expo-font";
import { error } from "console";

const DashboardLayout = () => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  //! Esse layout não renderiza as coisas do app
  //! Se for colocar algo que deve aparecer em todas as páginas
  //! Usa o layout que está fora da pasta
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
