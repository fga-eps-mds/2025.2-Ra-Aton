import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";

export default function Partidas() {
  const { isDarkMode } = useTheme();
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
      ></Text>
    </View>
  );
}
