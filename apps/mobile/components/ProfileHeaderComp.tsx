// components/ProfileHeaderComp.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

const { width } = Dimensions.get("window");
const BANNER_HEIGHT = 150;
const PROFILE_IMAGE_SIZE = 100;

interface ProfileHeaderProps {
  bannerUrl?: string;
  profileImageUrl?: string;
  name: string;
  identifier: string;
  bio?: string;
  followersCount?: number;
  isDarkMode: boolean;
  onBack: () => void;
  showEditButton?: boolean;
  onEdit?: () => void;
  profileType?: "user" | "group";
}

export const ProfileHeaderComp: React.FC<ProfileHeaderProps> = ({
  bannerUrl,
  profileImageUrl,
  name,
  identifier,
  bio,
  followersCount = 0,
  isDarkMode,
  onBack,
  showEditButton = false,
  onEdit,
  profileType = "user",
}) => {
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <View style={styles.container}>
      {/* Banner */}
      <View style={[styles.bannerContainer, { backgroundColor: theme.gray }]}>
        {bannerUrl ? (
          <Image source={{ uri: bannerUrl }} style={styles.bannerImage} />
        ) : (
          <View style={[styles.bannerPlaceholder, { backgroundColor: theme.orange }]} />
        )}
        
        {/* Botão de voltar */}
        <TouchableOpacity
          onPress={onBack}
          style={[styles.backButton, { backgroundColor: theme.background }]}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>

        {/* Botão de editar (apenas se showEditButton for true) */}
        {showEditButton && onEdit && (
          <TouchableOpacity
            onPress={onEdit}
            style={[styles.editButton, { backgroundColor: theme.background }]}
          >
            <Ionicons name="create-outline" size={24} color={theme.orange} />
          </TouchableOpacity>
        )}
      </View>

      {/* Foto de perfil (sobreposta ao banner) */}
      <View style={styles.profileImageContainer}>
        <View style={[styles.profileImageWrapper, { backgroundColor: theme.background }]}>
          {profileImageUrl ? (
            <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: theme.gray }]}>
              <Ionicons name="person" size={50} color={theme.text} />
            </View>
          )}
        </View>
      </View>

      {/* Informações do perfil */}
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
        <Text style={[styles.identifier, { color: theme.gray }]}>@{identifier}</Text>
        
        {bio && (
          <Text style={[styles.bio, { color: theme.text }]} numberOfLines={3}>
            {bio}
          </Text>
        )}

        {/* Só mostra se profileType for "grupo" */}
        {profileType === "group" && (
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {followersCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.gray }]}>
              Seguidores
            </Text>
          </View>
        </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  bannerContainer: {
    width: "100%",
    height: BANNER_HEIGHT,
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerPlaceholder: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  editButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileImageContainer: {
    alignItems: "center",
    marginTop: -(PROFILE_IMAGE_SIZE / 2),
    zIndex: 10,
  },
  profileImageWrapper: {
    width: PROFILE_IMAGE_SIZE + 8,
    height: PROFILE_IMAGE_SIZE + 8,
    borderRadius: (PROFILE_IMAGE_SIZE + 8) / 2,
    padding: 4,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileImage: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
  },
  profileImagePlaceholder: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  identifier: {
    fontSize: 16,
    marginTop: 4,
    textAlign: "center",
  },
  bio: {
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 16,
    gap: 24,
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});
