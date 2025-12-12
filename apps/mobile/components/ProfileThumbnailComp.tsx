import React from "react";
import { Image, TouchableOpacity, StyleSheet, ViewStyle, View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { useUser } from "@/libs/storage/UserContext";
import { Ionicons } from "@expo/vector-icons"; // Importando Ionicons

interface ProfileThumbnailProps {
  imageUrl?: string | null;
  size?: number;
  onPress?: () => void;
  style?: ViewStyle;
  userName?: string;
  userId?: string;
  profileType: "user" | "group";
}

const ProfileThumbnailComp: React.FC<ProfileThumbnailProps> = ({
  imageUrl,
  size = 50,
  onPress,
  style,
  userName,
  userId,
  profileType,
}) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const router = useRouter();
  const { user } = useUser();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      const targetUserName = userName || user?.userName;
      
      if (targetUserName) {
        router.push({
          pathname: "/(DashBoard)/(tabs)/Perfil",
          params: { identifier: targetUserName, type: profileType || "user" },
        });
      }
    }
  };

  const renderContent = () => {

    if (imageUrl) {
      return (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: "100%", height: "100%", borderRadius: size / 2 }}
          resizeMode="cover"
        />
      );
    }

    if (profileType === "user") {
      return (
        <View style={styles.iconContainer}>
          <Ionicons 
            name="person" 
            size={size * 0.5} // Tamanho proporcional 
            color={theme.text} 
          />
        </View>
      );
    }

    if (profileType === "group") {
      return (
        <View style={styles.iconContainer}>
          <Ionicons 
            name="people" 
            size={size * 0.5} 
            color={theme.text} 
          />
        </View>
      );
    }
    return (
      <Image
        source={require("@/assets/img/logo1.png")}
        style={{ width: "100%", height: "100%", borderRadius: size / 2 }}
        resizeMode="cover"
      />
    );
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: theme.orange,
          backgroundColor: isDarkMode ? Colors.dark.input : Colors.light.gray, 
          justifyContent: "center", 
          alignItems: "center"
        },
        style,
      ]}
      activeOpacity={0.7}
      testID="profile-thumbnail"
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    overflow: "hidden",
  },
  iconContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  }
});

export default ProfileThumbnailComp;