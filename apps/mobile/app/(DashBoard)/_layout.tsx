import React from "react";
import { Text, View } from "react-native";
import { Tabs } from "expo-router";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../constants/Theme";


const DashboardLayout = () => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

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
