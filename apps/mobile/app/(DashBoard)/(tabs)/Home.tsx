import React, { useCallback } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { useUser } from "@/libs/storage/UserContext";
import BackGroundComp from "@/components/BackGroundComp";
import ProfileThumbnailComp from "@/components/ProfileThumbnailComp";
import PostCardComp from "@/components/PostCardComp";
import MoreOptionsModalComp from "@/components/MoreOptionsModalComp";
import CommentsModalComp from "@/components/CommentsModalComp";
import InputComp from "@/components/InputComp";
import { EventInfoModalComp } from "@/components/EventInfoModal";
import Spacer from "@/components/SpacerComp";
import ReportReasonModal from "@/components/ReportReasonModal";
import { useFeedEvents } from "@/libs/hooks/useFeedEvents";
import { useFeedModals } from "@/libs/hooks/useModalFeed";
import { useFocusEffect } from "expo-router"; 
import { Ionicons } from "@expo/vector-icons";
import { useNotifications } from "@/libs/storage/NotificationContext";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const { user, refreshUser } = useUser();

  useFocusEffect(
    useCallback(() => {
      if (refreshUser) {
        refreshUser();
      }
    }, [])
  );

  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
    const router = useRouter();
  
  const {
    posts,
    setPosts,
    isLoading,
    isRefreshing,
    hasNextPage,
    onRefresh,
    reloadFeed,
    onEndReached,
  } = useFeedEvents();

  const {
    isOptionsVisible,
    isCommentsVisible,
    isReportModalVisible,
    showModal,
    selectedPostId,
    comments,
    isLoadingComments,
    handleOpenComments,
    handleCloseComments,
    handleOpenOptions,
    handleCloseInfoModel,
    handleStartReportFlow,
    handleCloseModals,
    handleSubmitReport,
    openModalInfos,
    closeModalInfos,
    handlePostComment,
  } = useFeedModals({ user, setPosts });

  const postInfosModal = selectedPostId
    ? posts.find((p) => String(p.id) === selectedPostId)
    : null;
  
    const { unreadCount } = useNotifications();

  return (
    <BackGroundComp>
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PostCardComp
            post={item}
            onPressComment={handleOpenComments}
            onPressOptions={handleOpenOptions}
            onReloadFeed={reloadFeed}
          />
        )}
        ListHeaderComponent={
  <View style={styles.containerHeader}>
    <ProfileThumbnailComp
              size={50}
              userName={user?.userName ?? "User"}
              imageUrl={user?.profilePicture ?? null}
              profileType={"user"}
            />
    <TouchableOpacity onPress={() => router.push("/Notifications")} style={{alignSelf: 'flex-end', position: 'relative'}}>
      {unreadCount > 0 && (
        <View
          style={{
            backgroundColor: 'red',
            marginLeft: 8,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 10,
            minWidth: 20,
            alignItems: 'center',
            position: 'absolute', 
            top: -5,  
            right: -5,  
          }}
        >
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
            {unreadCount}
          </Text>
        </View>
      )}
      <Ionicons name="notifications-outline" size={30} color={theme.orange} />
    </TouchableOpacity>
  </View>
}

        ListEmptyComponent={
          !isLoading && !isRefreshing ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <Text style={{ color: "white" }}>
                Nenhuma publicação por aqui ainda.
              </Text>
            </View>
          ) : null
        }
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          isLoading && hasNextPage ? (
            <View style={{ paddingVertical: 16 }}>
              <ActivityIndicator />
            </View>
          ) : null
        }
        initialNumToRender={5}
        maxToRenderPerBatch={8}
        windowSize={8}
        removeClippedSubviews
        ItemSeparatorComponent={() => <Spacer height={8} />}
      />

      <MoreOptionsModalComp
        isVisible={isOptionsVisible}
        onClose={handleCloseInfoModel}
        onReport={handleStartReportFlow}
        onInfos={openModalInfos}
      />

      <CommentsModalComp
        isVisible={isCommentsVisible}
        onClose={handleCloseComments}
        comments={comments}
        isLoading={isLoadingComments}
        onSendComment={handlePostComment}
      />

      <EventInfoModalComp
        post={postInfosModal}
        visible={showModal}
        onClose={closeModalInfos}
      />

      <ReportReasonModal
        isVisible={isReportModalVisible}
        onClose={handleCloseModals}
        onSubmit={handleSubmitReport}
      />
    </BackGroundComp>
  );
}

const styles = StyleSheet.create({
  containerHeader: {
    flexDirection: "row"  ,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    paddingTop: 8,
    paddingBottom: 8,
    columnGap: 10,
  },
  boxSearchComp: {
    flex: 1,
  },
});