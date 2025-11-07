import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";

interface LikeButtonProps {
  initialLiked?: boolean;
  onLike: (isLiked: boolean) => Promise<void>; // Função que chama a API
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

    // TODO: Criar requisição na pasta libs/posts, importar, usar neste componente e testá-la. (CA5)
    // A função 'onLike' (passada por props) deve conter a chamada da API
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
        color={isLiked ? theme.orange : theme.text} // TODO: Usar cor "Like" do Figma
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
