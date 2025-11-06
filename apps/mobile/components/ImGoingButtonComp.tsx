import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";

interface ImGoingButtonProps {
  initialGoing?: boolean;
  onToggleGoing: (isGoing: boolean) => Promise<void>;
}

const ImGoingButtonComp: React.FC<ImGoingButtonProps> = ({
  initialGoing = false,
  onToggleGoing,
}) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [isGoing, setIsGoing] = useState(initialGoing);
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const newGoingState = !isGoing;

    // TODO: Criar requisição na pasta libs/events, importar, usar neste componente e testá-la. (CA5)
    try {
      await onToggleGoing(newGoingState);
      setIsGoing(newGoingState);
    } catch (error) {
      console.error("Erro ao atualizar presença:", error);
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
        name={isGoing ? "person-add-outline" : "person-add-outline"}
        size={28}
        color={isGoing ? theme.orange : theme.text} // TODO: Usar cor "Confirmado" do Figma
        style={styles.icon}
        testID="going-button-icon"
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

export default ImGoingButtonComp;
