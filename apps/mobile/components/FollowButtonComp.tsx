// components/FollowButtonComp.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Colors } from "@/constants/Colors";

interface FollowButtonProps {
  isFollowing: boolean;
  onPress: () => void;
  isLoading?: boolean;
  isDarkMode: boolean;
}

export const FollowButtonComp: React.FC<FollowButtonProps> = ({
  isFollowing,
  onPress,
  isLoading = false,
  isDarkMode,
}) => {
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      testID="follow-button"
      style={[
        styles.button,
        isFollowing
          ? { backgroundColor: theme.gray }
          : { backgroundColor: theme.orange },
      ]}
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <Text style={styles.buttonText}>
          {isFollowing ? "Seguindo" : "Seguir"}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
