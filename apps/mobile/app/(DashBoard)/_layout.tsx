// ARQUIVO: apps/mobile/app/(DashBoard)/_layout.tsx
import React from "react";
import { Drawer } from "expo-router/drawer";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { CustomDrawerContent } from "../../components/CustomDrawerContent";

const DashboardLayout = () => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false, // Oculta o Header padrão do Drawer,
        drawerStyle: {
          backgroundColor: theme.background,
          width: 300,
        },
        drawerActiveTintColor: theme.orange,
        drawerInactiveTintColor: theme.text,
      }}
    >
      {/*
        A ÚNICA tela que o Drawer gerencia diretamente é o GRUPO (tabs).
        Os links "Início" e "Amigos" e outras são agora controlados 
        pelo CustomDrawerContent.
      */}
      {/* A ÚNICA tela que o Drawer gerencia é o grupo (tabs) */}
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerItemStyle: { display: "none" }, // Esconde dos links automáticos
        }}
      />
    </Drawer>
  );
};

export default DashboardLayout;
