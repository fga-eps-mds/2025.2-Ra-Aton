import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
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
import AppText from "@/components/AppText";

import { UseModalFeedMatchs } from "@/libs/hooks/useFeedMatchs";
import { HandleMatchComp } from "@/components/HandleMatchComp";
import { MatchDetailsModal } from "@/components/MatchDetailsModal";
import MoreOptionsModalComp from "@/components/MoreOptionsModalComp";
import ReportReasonModal from "@/components/ReportReasonModal";
import { ModalDescription } from "@/components/ModalDescription";
import { Imatches } from "@/libs/interfaces/Imatches";
import {
  getMatchById,
  subscribeToMatch,
  unsubscribeFromMatch,
  switchTeam,
} from "@/libs/auth/handleMatch";

export default function ProfileScreen() {
  const { identifier, type } = useLocalSearchParams<{
    identifier: string;
    type: string;
  }>();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { user: currentUser } = useUser();

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

  useFocusEffect(
    useCallback(() => {
      reloadProfile();
    }, [reloadProfile]),
  );

  const {
    visibleConfirmCard,
    visible,
    visibleInfosHandleMatch,
    visibleReportMatch,
    visibleDescriptionMatch,
    selectedMatch,
    useModal,
    closeModal,
    openModalConfirmCard,
    closeModalConfirmCard,
    openModalMoreInfosHandleModal,
    closeModalMoreInfosHandleModal,
    openReportMatchModal,
    closeReportMatchModal,
    openDetailsFromHandle,
    openDescriptionMatchModal,
    closeDescriptionMatchModal,
  } = UseModalFeedMatchs();

  const checkIsSubscribed = (match: Imatches) => {
    if (!currentUser?.id) return false;
    const inTeamA = match.teamA?.players?.some((p) => p.id === currentUser.id);
    const inTeamB = match.teamB?.players?.some((p) => p.id === currentUser.id);
    return !!(inTeamA || inTeamB);
  };

  const handleJoinMatch = async (match: Imatches) => {
    if (checkIsSubscribed(match)) {
      try {
        const updated = await getMatchById(match.id);
        openModalConfirmCard(updated);
      } catch (e) {
        Alert.alert("Erro", "Não foi possível carregar a partida.");
      }
      return;
    }

    Alert.alert("Participar", "Deseja participar desta partida?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        onPress: async () => {
          try {
            await subscribeToMatch(match.id);
            await reloadProfile();
            const updated = await getMatchById(match.id);
            openModalConfirmCard(updated);
          } catch (err: any) {
            const msg =
              err.response?.data?.message || "Erro ao entrar na partida";
            Alert.alert("Erro", msg);
          }
        },
      },
    ]);
  };

  const handleSwitchTeam = async (match: Imatches) => {
    Alert.alert("Trocar de Time", "Deseja trocar de time?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        onPress: async () => {
          try {
            await switchTeam(match.id);
            const updated = await getMatchById(match.id);
            openModalConfirmCard(updated);
            reloadProfile();
          } catch (err: any) {
            Alert.alert(
              "Erro",
              err.response?.data?.message || "Erro ao trocar de time",
            );
          }
        },
      },
    ]);
  };

  const handleLeaveMatch = async (match: Imatches) => {
    Alert.alert("Sair", "Deseja sair da partida?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            await unsubscribeFromMatch(match.id);
            closeModalConfirmCard();
            closeModalMoreInfosHandleModal();
            reloadProfile();
          } catch (err: any) {
            Alert.alert(
              "Erro",
              err.response?.data?.message || "Erro ao sair da partida",
            );
          }
        },
      },
    ]);
  };

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

  if (isLoading && !profile) {
    return (
      <BackGroundComp>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.orange} />
        </View>
      </BackGroundComp>
    );
  }

  const isOwnProfile =
    profileType === "user" && currentUser?.userName === profileIdentifier;
  const userProfile = profileType === "user" ? (profile as IUserProfile) : null;
  const groupProfile =
    profileType === "group" ? (profile as IGroupProfile) : null;
  const userTabs = profileType === "user" ? (tabs as IUserProfileTabs) : null;
  const groupTabs =
    profileType === "group" ? (tabs as IGroupProfileTabs) : null;

  const renderProfileHeader = () => (
    <View>
      {profile && (
        <ProfileHeaderComp
          bannerUrl={userProfile?.bannerImage || groupProfile?.bannerUrl}
          profileImageUrl={userProfile?.profilePicture || groupProfile?.logoUrl}
          name={profile.name}
          identifier={userProfile?.userName || groupProfile?.name || ""}
          bio={profile.bio}
          followersCount={profile.followersCount}
          isDarkMode={isDarkMode}
          onBack={() => router.back()}
          showEditButton={
            (profileType === "user" && userProfile?.isOwner === true) ||
            (profileType === "group" &&
              (groupProfile?.isLeader === true ||
                (groupProfile as any)?.isOwner === true))
          }
          onEdit={() => {
            if (profileType === "user" && userProfile) {
              router.push({
                pathname: "/(DashBoard)/(tabs)/(edit)/editarUsuario",
                params: {
                  userId: userProfile.id,
                  userName: userProfile.userName,
                  profilePicture: userProfile.profilePicture || "",
                  bannerImage: userProfile.bannerImage || "",
                  bio: userProfile.bio || "",
                },
              } as any);
            } else if (profileType === "group" && groupProfile) {
              router.push({
                pathname: "/(DashBoard)/(tabs)/(edit)/editarGrupo",
                params: {
                  groupId: groupProfile.id,
                  groupName: groupProfile.name,
                  logoUrl: groupProfile.logoUrl || "",
                  bannerUrl: groupProfile.bannerUrl || "",
                  bio: groupProfile.bio || "",
                },
              } as any);
            }
          }}
        />
      )}

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

      {/* {profile && profile.bio ? (
        <View style={{ paddingHorizontal: 20, marginBottom: 10, alignItems:'center', marginTop:10, }}>
          <AppText style={{ color: Colors.dark.text, fontSize: 18 }}>
            {profile.bio}
          </AppText>
        </View>
      ) : null} */}
    </View>
  );

  return (
    <BackGroundComp>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={styles.tabsContainer}>
            {userTabs ? (
              <ProfileTabsComp
                type="user"
                ListHeaderComponent={renderProfileHeader()}
                matches={userTabs.matches || []}
                followedGroups={userTabs.followedGroups || []}
                memberGroups={userTabs.memberGroups || []}
                isDarkMode={isDarkMode}
                currentUserId={currentUser?.id}
                onPressMatchInfos={(match) => useModal(match)}
                onPressJoinMatch={(match) => handleJoinMatch(match)}
                onReload={reloadProfile}
                isLoading={isLoading}
              />
            ) : groupTabs ? (
              <ProfileTabsComp
                type="group"
                ListHeaderComponent={renderProfileHeader()}
                members={groupTabs.members || []}
                posts={groupTabs.posts || []}
                isDarkMode={isDarkMode}
                onPressComment={(postId) =>
                  console.log("Comentar post:", postId)
                }
                onPressOptions={(postId) => console.log("Opções post:", postId)}
                onReload={reloadProfile}
                isLoading={isLoading}
              />
            ) : null}
          </View>

          <HandleMatchComp
            isVisible={visibleConfirmCard}
            onClose={closeModalConfirmCard}
            match={selectedMatch ?? undefined}
            onPressMoreInfos={openModalMoreInfosHandleModal}
            onSwitchTeam={
              selectedMatch
                ? () => handleSwitchTeam(selectedMatch)
                : undefined
            }
          />

          <ReportReasonModal
            isVisible={visibleReportMatch}
            onClose={closeReportMatchModal}
          />

          <MoreOptionsModalComp
            isVisible={visibleInfosHandleMatch}
            onClose={closeModalMoreInfosHandleModal}
            onInfos={openDetailsFromHandle}
            onDetailsMatch={openDescriptionMatchModal}
            onLeaveMatch={
              selectedMatch
                ? () => handleLeaveMatch(selectedMatch)
                : undefined
            }
          />

          <MatchDetailsModal
            visible={visible}
            onClose={closeModal}
            match={selectedMatch ?? undefined}
          />

          <ModalDescription
            visible={visibleDescriptionMatch}
            onClose={closeDescriptionMatchModal}
            title={selectedMatch?.title}
            description={selectedMatch?.description}
          />
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
  loadingContainer: {
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
  },
});