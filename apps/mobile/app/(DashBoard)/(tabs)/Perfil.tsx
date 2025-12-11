import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import BackGroundComp from "@/components/BackGroundComp";
import { ProfileHeaderComp } from "@/components/ProfileHeaderComp";
import { FollowButtonComp } from "@/components/FollowButtonComp";
import { ProfileTabsComp } from "@/components/ProfileTabsComp";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { useProfile } from "@/libs/hooks/useProfile";
import {
  ProfileType,
  IUserProfile,
  IGroupProfile,
  IUserProfileTabs,
  IGroupProfileTabs,
} from "@/libs/interfaces/Iprofile";
import { useUser } from "@/libs/storage/UserContext";

export default function ProfileScreen() {
  const { identifier, type } = useLocalSearchParams<{
    identifier: string;
    type: string;
  }>();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { user: currentUser } = useUser();

  // Determina o tipo de perfil (user ou group)
  const profileType: ProfileType = (type as ProfileType) || "user";
  const profileIdentifier = identifier || "";

  const {
    profile,
    tabs,
    isLoading,
    error,
    isFollowing,
    toggleFollow,
    reloadProfile,
  } = useProfile(profileIdentifier, profileType);

  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert("Erro", error);
    }
  }, [error]);

  const handleFollowPress = async () => {
    setIsFollowLoading(true);
    try {
      await toggleFollow();
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <BackGroundComp>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.orange} />
          </View>
        </SafeAreaView>
      </BackGroundComp>
    );
  }

  if (!profile || !tabs) {
    return (
      <BackGroundComp>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.errorContainer, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.orange} />
          </View>
        </SafeAreaView>
      </BackGroundComp>
    );
  }

  // Verifica se é o próprio perfil do usuário
  const isOwnProfile =
    profileType === "user" && currentUser?.userName === profileIdentifier;

  // Type guards e variáveis auxiliares
  const userProfile = profileType === "user" ? (profile as IUserProfile) : null;
  const groupProfile = profileType === "group" ? (profile as IGroupProfile) : null;
  const userTabs = profileType === "user" ? (tabs as IUserProfileTabs) : null;
  const groupTabs = profileType === "group" ? (tabs as IGroupProfileTabs) : null;

  // Debug: verificar o que está vindo do profile
  console.log("Profile data:", profile);
  console.log("Group profile:", groupProfile);
  console.log("Is Leader?", groupProfile?.isLeader);

  return (
    <BackGroundComp>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Cabeçalho do perfil */}
            <ProfileHeaderComp
              bannerUrl={
                userProfile?.bannerImage || groupProfile?.bannerUrl
              }
              profileImageUrl={
                userProfile?.profilePicture || groupProfile?.logoUrl
              }
              name={profile.name}
              identifier={
                userProfile?.userName || groupProfile?.name || ""
              }
              bio={profile.bio}
              followersCount={profile.followersCount}
              isDarkMode={isDarkMode}
              onBack={() => router.back()}
              showEditButton={
                profileType === "group" && 
                (groupProfile?.isLeader === true || (groupProfile as any)?.isOwner === true)
              }
              onEdit={() => {
                if (groupProfile) {
                  router.push({
                    pathname: "/(DashBoard)/(tabs)/(edit)/editarGrupo",
                    params: {
                      groupId: groupProfile.id,
                      groupName: groupProfile.name,
                      logoUrl: groupProfile.logoUrl || "",
                      bannerUrl: groupProfile.bannerUrl || "",
                    },
                  } as any);
                }
              }}
            />

            {/* Botão de seguir (apenas se não for o próprio perfil) */}
            {!isOwnProfile && profileType === "group" && (
              <View style={styles.followButtonContainer}>
                <FollowButtonComp
                  isFollowing={isFollowing}
                  onPress={handleFollowPress}
                  isLoading={isFollowLoading}
                  isDarkMode={isDarkMode}
                />
              </View>
            )}

            {/* Abas com conteúdo */}
            <View style={styles.tabsContainer}>
              {userTabs ? (
                <ProfileTabsComp
                  type="user"
                  matches={userTabs.matches || []}
                  followedGroups={userTabs.followedGroups || []}
                  memberGroups={userTabs.memberGroups || []}
                  isDarkMode={isDarkMode}
                />
              ) : groupTabs ? (
                <ProfileTabsComp
                  type="group"
                  members={groupTabs.members || []}
                  posts={groupTabs.posts || []}
                  isDarkMode={isDarkMode}
                  onPressComment={(postId) =>
                    console.log("Comentar post:", postId)
                  }
                  onPressOptions={(postId) =>
                    console.log("Opções post:", postId)
                  }
                />
              ) : null}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </BackGroundComp>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  followButtonContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  tabsContainer: {
    flex: 1,
    minHeight: 400,
  },
});