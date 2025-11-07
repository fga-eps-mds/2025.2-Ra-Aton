import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";

interface CommentButtonProps {
  onPress: () => void;
}

const CommentButtonComp: React.FC<CommentButtonProps> = ({ onPress }) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Ionicons
        name="chatbubble-outline"
        size={28}
        color={theme.text}
        style={styles.icon}
        testID="comment-button"
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

export default CommentButtonComp;
