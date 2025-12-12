import React from "react";
import { Tabs, useNavigation } from "expo-router";
import { DrawerActions, EventArg } from "@react-navigation/native";
import { Colors } from "../../../constants/Colors";
import { useTheme } from "../../../constants/Theme";
import { Ionicons } from "@expo/vector-icons";

export default function DashboardTabsLayout() {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const navigation = useNavigation();

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
          height: 105,
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

      <Tabs.Screen
        name="Home" 
        options={{
          title: "Feed",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Teams" 
        options={{
          title: "Equipes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="NovoPost" 
        options={{
          title: "Post",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Partidas" 
        options={{
          title: "Partidas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="basketball-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu-outline" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e: EventArg<"tabPress", true>) => {
            e.preventDefault();
            navigation.dispatch(DrawerActions.openDrawer());
          },
        }}
      />


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

      <Tabs.Screen
        name="(create)/criarGrupo"
        options={{
          title: "Criar Grupo",
          href: null,
        }} // Esconde da Navbar
      />

      <Tabs.Screen
        name="(create)/gerenciarPost"
        options={{
          title: "Gerenciar Post",
          href: null,
        }} // Esconde da Navbar
      />

      <Tabs.Screen
        name="Perfil"
        options={{
          title: "Perfil",
          href: null,
        }} // Esconde da Navbar
      />
      
      <Tabs.Screen
        name="Solicitacoes"
        options={{
          title: "Solicitacoes",
          href: null,
        }} // Esconde da Navbar
      />

      <Tabs.Screen
        name="(create)/gerenciarPartidas"
        options={{
          title: "Solicitacoes",
          href: null,
        }} // Esconde da Navbar
      />

      <Tabs.Screen
        name="(edit)/editarPost"
        options={{
          title: "Editar Post",
          href: null,
        }} // Esconde da Navbar
      />

      <Tabs.Screen
        name="(edit)/editEvento"
        options={{
          title: "Editar Post",
          href: null,
        }} // Esconde da Navbar
      />

      <Tabs.Screen
        name="Notifications"
        options={{
          title: "Notificacoes",
          href: null,
        }} // Esconde da Navbar
      />

      <Tabs.Screen
        name="(edit)/editarGrupo"
        options={{
          title: "Editar Grupo",
          href: null,
        }} // Esconde da Navbar
      />
      <Tabs.Screen
        name="(edit)/editarUsuario"
        options={{
          title: "Editar Usuário",
          href: null,
        }} // Esconde da Navbar
      />
    </Tabs>


  );
}
