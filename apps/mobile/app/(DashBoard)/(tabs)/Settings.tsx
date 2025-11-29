import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, ActivityIndicator, Alert } from "react-native";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { useUser } from "@/libs/storage/UserContext";
import PrimaryButton from "@/components/PrimaryButton";
import Spacer from "@/components/SpacerComp";
import { Fonts } from "@/constants/Fonts";
import { api_route } from "@/libs/auth/api";

export default function SettingsScreen() {
  const { isDarkMode } = useTheme();
  const { user, setUser, logout, confirmDelete } = useUser(); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(user?.notificationsAllowed ?? true);

  useEffect(() => {
    if (user) {
      setIsEnabled(user.notificationsAllowed ?? true);
    }
  }, [user]);

  const toggleSwitch = async () => {
    if (!user) return;

    const newValue = !isEnabled;
    setIsEnabled(newValue);
    setIsLoading(true);

    try {
      
      await api_route.patch(`/users/${user.userName}`, {
        notificationsAllowed: newValue
      });
      setUser({ ...user, notificationsAllowed: newValue });

    } catch (error) {
      console.error("Erro ao mudar preferência de notificação:", error);
      setIsEnabled(!newValue);
      Alert.alert("Erro", "Não foi possível atualizar sua preferência.");
    } finally {
      setIsLoading(false);
    }
  };

  const themeStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
      backgroundColor: isDarkMode
        ? Colors.dark.background
        : Colors.light.background,
    },
    text: {
      color: isDarkMode ? Colors.dark.text : Colors.light.text,
      fontSize: 24,
      fontFamily: Fonts.mainFont.dongleRegular,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      maxWidth: 300, // Limita a largura para ficar bonito no centro
      paddingVertical: 10,
    }
  });

  return (
    <View style={themeStyles.container}>
      <Text style={[themeStyles.text, { fontSize: 40, marginBottom: 20 }]}>
        CONFIGURAÇÕES
      </Text>

      <View style={themeStyles.row}>
        <Text style={themeStyles.text}>Receber Notificações</Text>
        
        {isLoading ? (
           <ActivityIndicator color={Colors.dark.orange} />
        ) : (
          <Switch
            trackColor={{ false: "#767577", true: Colors.dark.orange }}
            thumbColor={isEnabled ? "#f4f3f4" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        )}
      </View>

      <Spacer height={40} />
      
      <PrimaryButton onPress={logout}>Sair</PrimaryButton>
      
      <Spacer height={20} />
      
      <PrimaryButton onPress={confirmDelete} style={{ backgroundColor: 'red' }}>
        Excluir conta
      </PrimaryButton>
    </View>
  );
}