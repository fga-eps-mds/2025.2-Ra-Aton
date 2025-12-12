import React, { useEffect, useState, useCallback } from "react";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  TouchableOpacity,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import BackGroundComp from "@/components/BackGroundComp";
import { ProfileHeaderComp } from "@/components/ProfileHeaderComp";
import { FollowButtonComp } from "@/components/FollowButtonComp";
import { ProfileTabsComp } from "@/components/ProfileTabsComp";
import InviteMemberModal from "@/components/InviteMemberModalComp";
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

import { useFeedModals } from "@/libs/hooks/useModalFeed";
import CommentsModalComp from "@/components/CommentsModalComp";
import { EventInfoModalComp } from "@/components/EventInfoModal";
import { removeMember } from "@/libs/groupMembership/removeMember";

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


  // --- INÍCIO DA SUA INSERÇÃO (LOGICA) ---
  const [inviteModalVisible, setInviteModalVisible] = useState(false);

  // Lógica para saber se é Admin (CORRIGIDA)
  const isCurrentUserAdmin =
    profileType === "group" &&
    currentUser &&
    profile && // <--- ADICIONADO: Verifica se o perfil já carregou
    ((profile as IGroupProfile).leaderId === currentUser.id); // Ou .ownerId, dependendo da sua interface

  const handleRemoveMember = async (membershipId: string) => {
    try {
      await removeMember(membershipId);
      Alert.alert("Sucesso", "Membro removido.");
      reloadProfile(); // Atualiza a tela
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    }
  };

  // --- FIM DA SUA INSERÇÃO ---

  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      reloadProfile();
    }, [reloadProfile]),
  );

  const {
    isOptionsVisible: isPostOptionsVisible,
    isCommentsVisible: isPostCommentsVisible,
    isReportModalVisible: isPostReportVisible,
    selectedPostId: selectedPostIdForModal,
    comments: postComments,
    isLoadingComments,
    handleOpenComments,
    handleCloseComments,
    handleOpenOptions,
    handleCloseInfoModel,
    handleStartReportFlow,
    handleCloseModals,
    handleSubmitReport,
    handlePostComment,
    openModalInfos: openEventModal,
    closeModalInfos: closeEventModal,
    showModal: showEventModal,
  } = useFeedModals({ user: currentUser, setPosts: () => {} });

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

  const handleGroupPress = (groupName: string) => {
    router.push({
      pathname: "/(DashBoard)/(tabs)/Perfil",
      params: { identifier: groupName, type: "group" },
    });
  };

  const handleMemberPress = (userName: string) => {
    router.push({
      pathname: "/(DashBoard)/(tabs)/Perfil",
      params: { identifier: userName, type: "user" },
    });
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
    </View>
  );

  const selectedPostForInfo = groupTabs?.posts?.find(
    (p) => String(p.id) === selectedPostIdForModal
  ) || null;

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
                onPressGroup={(groupName) => handleGroupPress(groupName)}
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
                onPressComment={handleOpenComments}
                onPressOptions={handleOpenOptions}
                onPressMember={handleMemberPress}
                onInvitePress={() => setInviteModalVisible(true)}
                currentUserId={currentUser?.id}
                isAdmin={isCurrentUserAdmin}
                onRemoveMember={handleRemoveMember}
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

          {isCurrentUserAdmin && (
            <View style={styles.followButtonContainer}>
              
            </View>
          )}

          <ReportReasonModal
            isVisible={visibleReportMatch || isPostReportVisible}
            onClose={() => {
              closeReportMatchModal();
              handleCloseModals();
            }}
            onSubmit={isPostReportVisible ? handleSubmitReport : undefined}
          />

          <MoreOptionsModalComp
            isVisible={visibleInfosHandleMatch || isPostOptionsVisible}
            onClose={() => {
              closeModalMoreInfosHandleModal();
              handleCloseInfoModel();
            }}
            onInfos={
              visibleInfosHandleMatch
                ? openDetailsFromHandle
                : isPostOptionsVisible && selectedPostForInfo?.type === "EVENT"
                ? openEventModal
                : undefined
            }
            onDetailsMatch={visibleInfosHandleMatch ? openDescriptionMatchModal : undefined}
            onLeaveMatch={
              visibleInfosHandleMatch && selectedMatch
                ? () => handleLeaveMatch(selectedMatch)
                : undefined
            }
            onReport={isPostOptionsVisible ? handleStartReportFlow : undefined}
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

          <CommentsModalComp
            isVisible={isPostCommentsVisible}
            onClose={handleCloseComments}
            comments={postComments}
            isLoading={isLoadingComments}
            onSendComment={handlePostComment}
          />

          <EventInfoModalComp
            post={selectedPostForInfo}
            visible={showEventModal}
            onClose={closeEventModal}
          />

          {profileType === "group" && (
            <InviteMemberModal
              visible={inviteModalVisible}
              onClose={() => setInviteModalVisible(false)}
              groupId={profile?.id || groupProfile?.id || ""}
            />
          )}
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