import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";

interface OptionsButtonProps {
  onPress: () => void;
}

const OptionsButtonComp: React.FC<OptionsButtonProps> = ({ onPress }) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Ionicons
        name="ellipsis-vertical"
        size={28}
        color={theme.text}
        style={styles.icon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
  },
  icon: {
    width: 28,
    height: 28,
  },
});

export default OptionsButtonComp;
