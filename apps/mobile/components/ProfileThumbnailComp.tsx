import React from "react";
import { Image, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { useUser } from "@/libs/storage/UserContext";

interface ProfileThumbnailProps {
  imageUrl?: string | null;
  size?: number;
  onPress?: () => void;
  style?: ViewStyle;
  userName?: string; // userName do usuário para navegar ao perfil
  userId?: string; // Alternativa caso tenha apenas o ID
}

const ProfileThumbnailComp: React.FC<ProfileThumbnailProps> = ({
  imageUrl,
  size = 50,
  onPress,
  style,
  userName,
  userId,
}) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const router = useRouter();
  const { user } = useUser();

  const handlePress = () => {
    if (onPress) {
      // Se onPress foi passado, usa ele
      onPress();
    } else {
      // Usa o userName fornecido ou o do usuário logado
      const targetUserName = userName || user?.userName;
      
      if (targetUserName) {
        // Navega para o perfil usando o userName
        router.push({
          pathname: "/(DashBoard)/(tabs)/Perfil",
          params: { identifier: targetUserName, type: "user" },
        });
      }
    }
  };

  const source = imageUrl
    ? { uri: imageUrl }
    : require("@/assets/img/logo1.png"); // Usando um asset local como fallback

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: theme.orange, // Destaque da cor primária
        },
        style,
      ]}
      activeOpacity={0.7}
      testID="profile-thumbnail"
    >
      <Image
        source={source}
        style={{ width: "100%", height: "100%", borderRadius: size / 2 }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    overflow: "hidden",
    backgroundColor: Colors.light.gray, // Cor de fundo enquanto a imagem carrega
  },
});

export default ProfileThumbnailComp;
