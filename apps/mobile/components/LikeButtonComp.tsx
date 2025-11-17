import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";

interface LikeButtonProps {
  initialLiked?: boolean;
  onLike: (isLiked: boolean) => Promise<void>; 
}

const LikeButtonComp: React.FC<LikeButtonProps> = ({
  initialLiked = false,
  onLike,
}) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {

    if (isLoading) return;

    setIsLoading(true);
    const newLikedState = !isLiked;



    try {
      await onLike(newLikedState);
      setIsLiked(newLikedState);
    } catch (error) {
      console.error("Erro ao atualizar curtida:", error);
      // Reverte o estado em caso de falha
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ActivityIndicator
        size="small"
        color={theme.orange}
        style={styles.icon}
      />
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Ionicons
        name={isLiked ? "heart" : "heart-outline"}
        size={28}
        color={isLiked ? theme.orange : theme.orange} 
        style={styles.icon}
        testID="like-button-icon"
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

export default LikeButtonComp;
