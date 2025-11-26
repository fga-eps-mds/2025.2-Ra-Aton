import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { useUser } from "@/libs/storage/UserContext";
import PrimaryButton from "@/components/PrimaryButton";
import Spacer from "@/components/SpacerComp";

export default function FeedScreen() {
  const { isDarkMode } = useTheme();
  const { user, logout, confirmDelete } = useUser();
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
        <Spacer height={20} />
        <PrimaryButton onPress={logout}>Sair</PrimaryButton>
        <Spacer height={30} />
        <PrimaryButton onPress={confirmDelete}>Excluir conta</PrimaryButton>
      </View>
  );
}
