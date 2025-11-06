import React from "react";
import { Image, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";

interface ProfileThumbnailProps {
  imageUrl?: string | null;
  size?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

const ProfileThumbnailComp: React.FC<ProfileThumbnailProps> = ({
  imageUrl,
  size = 50,
  onPress,
  style,
}) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // TODO: Criar requisição na pasta libs/user, importar, usar neste componente e testá-la. (CA5)
  // Esta requisição deve buscar a URL da imagem do usuário logado.
  // Por enquanto, usamos uma imagem padrão se 'imageUrl' for nula.
  const source = imageUrl
    ? { uri: imageUrl }
    : require("@/assets/img/logo1.png"); // Usando um asset local como fallback

  return (
    <TouchableOpacity
      onPress={onPress}
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
