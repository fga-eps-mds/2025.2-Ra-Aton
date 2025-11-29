// ARQUIVO: apps/mobile/components/CustomDrawerContent.tsx
import React from "react";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
// import { useNavigation } from 'expo-router'; // <-- 1. REMOVA ESTE HOOK
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../constants/Theme";
import { Colors } from "../constants/Colors";
import { useUser } from "@/libs/storage/UserContext";

// import { NavigationProp } from '@react-navigation/native'; // <-- Não é mais necessário

// import { View } from 'react-native/types'; --- IGNORE ---
import { View, Text } from "react-native";
import { useNotifications } from "../libs/storage/NotificationContext";
export default CustomDrawerContent;

// O componente recebe 'props'
export function CustomDrawerContent(props: any) {
  const { user, logout } = useUser();

  const { unreadCount } = useNotifications();

  // 2. PEGUE O 'navigation' DIRETAMENTE DAS PROPS
  const { navigation } = props;

  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  /**
   * 3. Esta é a forma PADRÃO do React Navigation para navegar
   * para uma tela dentro de um navegador aninhado.
   *
   * navigation.navigate('NomeDoNavegadorFilho', { screen: 'NomeDaTelaInterna' })
   */
  const navigateTo = (screen: string) => {
    navigation.navigate("(tabs)", {
      screen: screen, // Passa 'Home' ou 'Friends'
    });
  };

  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: theme.background }}
    >
      {/* Item 1: Início (Home) */}
      <DrawerItem
        label="Início"
        labelStyle={{ color: theme.text, fontSize: 16 }}
        icon={({ color, size }) => (
          <Ionicons name="home-outline" size={size} color={theme.orange} />
        )}
        onPress={() => navigateTo("Home")} // 4. Manda só o nome da tela interna
      />

      {/* Item 2: Amigos (Friends) */}
      <DrawerItem
        label="Amigos"
        labelStyle={{ color: theme.text, fontSize: 16 }}
        icon={({ color, size }) => (
          <Ionicons
            name="person-add-outline"
            size={size}
            color={theme.orange}
          />
        )}
        onPress={() => navigateTo("Friends")} // 4. Manda só o nome da tela interna
      />

      {/* Adicione os outros (Perfil, Settings) aqui no mesmo padrão */}

      <DrawerItem
        label="Buscar Atléticas"
        labelStyle={{ color: theme.text, fontSize: 16 }}
        icon={({ color, size }) => (
          <Ionicons name="people-outline" size={size} color={theme.orange} />
        )}
        onPress={() => navigateTo("Atletica")} // 4. Manda só o nome da tela interna
      />

      <DrawerItem
        label="Próximos Jogos"
        labelStyle={{ color: theme.text, fontSize: 16 }}
        icon={({ color, size }) => (
          <Ionicons name="calendar-outline" size={size} color={theme.orange} />
        )}
        onPress={() => navigateTo("NextGames")} // 4. Manda só o nome da tela interna
      />

      <DrawerItem
        label="Solicitações"
        labelStyle={{ color: theme.text, fontSize: 16 }}
        icon={({ color, size }) => (
          <Ionicons name="notifications-outline" size={size} color={theme.orange} />
        )}
        onPress={() => navigateTo("Solicitacoes")}
      />

      <DrawerItem
        label={() => (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: theme.text, fontSize: 16 }}>Notificações</Text>

            {unreadCount > 0 && (
              <View
                style={{
                  backgroundColor: "red",
                  marginLeft: 8,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 10,
                  minWidth: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>
                  {unreadCount}
                </Text>
              </View>
            )}
          </View>
        )}
        icon={({ size }) => (
          <Ionicons
            name="notifications-outline"  // ÍCONE DE SININHO
            size={size}
            color={theme.orange}
          />
        )}
        onPress={() => navigateTo("Notifications")}
      />
      
      <DrawerItem
        label="Configurações"
        labelStyle={{ color: theme.text, fontSize: 16 }}
        icon={({ color, size }) => (
          <Ionicons name="settings-outline" size={size} color={theme.orange} />
        )}
        onPress={() => navigateTo("Settings")} // 4. Manda só o nome da tela interna
      />
      <DrawerItem
        label="Sair"
        labelStyle={{ color: theme.text, fontSize: 16 }}
        icon={({ color, size }) => (
          <Ionicons name="exit-outline" size={size} color={theme.orange} />
        )}
        onPress={() => logout()} // 4. Manda só o nome da tela interna
      />
    </DrawerContentScrollView>
  );
}

