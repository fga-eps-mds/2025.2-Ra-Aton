import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { useUser } from "@/libs/storage/UserContext";
import PrimaryButton from "@/components/PrimaryButton";

export default function FeedScreen() {
  const { isDarkMode } = useTheme();
  const { user, logout } = useUser();
  const themeStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDarkMode
        ? Colors.dark.background
        : Colors.light.background,
    },
  });
  return (
    <View style={themeStyles.container}>
      <Text
        style={{
          color: isDarkMode ? Colors.dark.text : Colors.light.text,
          fontSize: 18,
        }}
      >
        TELA DE CONFIGURAÇÕES
      </Text>
      <PrimaryButton onPress={logout}>Sair</PrimaryButton>
    </View>
  );
}
