import React from "react";
// Imports necessários para o botão "Menu" da Sidebar
import { Tabs, useNavigation } from "expo-router";
import { DrawerActions, EventArg } from "@react-navigation/native";
// Imports de Estilo
import { Colors } from "../../../constants/Colors";
import { useTheme } from "../../../constants/Theme";
import { Ionicons } from "@expo/vector-icons";

export default function DashboardTabsLayout() {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Hook para controlar a navegação (necessário para abrir o Drawer)
  const navigation = useNavigation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // O Header agora é controlado pelo Drawer (pai)
        tabBarActiveTintColor: theme.orange,
        tabBarInactiveTintColor: theme.text,
        tabBarStyle: {
          backgroundColor: theme.input,
          borderTopWidth: 2,
          borderTopColor: theme.orange,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
          marginTop: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 1,
        },
      }}
    >
      {/* ===== BOTÕES VISÍVEIS NA NAVBAR ===== */}

      <Tabs.Screen
        name="Home" // Referencia (tabs)/Home.tsx
        options={{
          title: "Feed",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Teams" // Referencia (tabs)/Teams.tsx
        options={{
          title: "Equipes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="NovoPost" // Referencia (tabs)/NovoPost.tsx
        options={{
          title: "Post",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Partidas" // Referencia (tabs)/Partidas.tsx
        options={{
          title: "Partidas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="basketball-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ===== BOTÃO FALSO PARA ABRIR A SIDEBAR (MENU) ===== */}
      <Tabs.Screen
        name="menu" // Nome "falso", Ele aponta para o arquivo "Dummy" menu.tsx -- se deletar esse arquivo, o botão some.
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu-outline" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e: EventArg<"tabPress", true>) => {
            // Previne a navegação para uma tela "menu"
            e.preventDefault();
            // Dispara a ação de abrir a Sidebar (Drawer)
            navigation.dispatch(DrawerActions.openDrawer());
          },
        }}
      />

      {/* ===== TELAS ESCONDIDAS (Acessíveis pela Sidebar) ===== */}

      <Tabs.Screen
        name="Friends" // Referencia (tabs)/Friends.tsx
        options={{
          title: "Amigos",
          href: null,
        }} // Esconde da Navbar
      />
      <Tabs.Screen
        name="Settings" // Referencia (tabs)/Friends.tsx
        options={{
          title: "Configurações",
          href: null,
        }} // Esconde da Navbar
      />
      <Tabs.Screen
        name="NextGames" // Referencia (tabs)/Friends.tsx
        options={{
          title: "Próximos Jogos",
          href: null,
        }} // Esconde da Navbarw
      />

      <Tabs.Screen
        name="Atletica" // Referencia (tabs)/Friends.tsx
        options={{
          title: "Buscar Atlética",
          href: null,
        }} // Esconde da Navbar
      />

      <Tabs.Screen
        name="(create)/criarEvento"
        options={{
          title: "Buscar Atlética",
          href: null,
        }} // Esconde da Navbar
      />

      <Tabs.Screen
        name="(create)/criarPost"
        options={{
          title: "Buscar Atlética",
          href: null,
        }} // Esconde da Navbar
      />

      <Tabs.Screen
        name="(create)/criarPartida"
        options={{
          title: "Buscar Atlética",
          href: null,
        }} // Esconde da Navbar
      />
    </Tabs>
  );
}
