import React from "react";
import { StyleSheet, View, FlatList, ActivityIndicator, Text } from "react-native";
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

export default function HomeScreen() {
  const { user } = useUser();

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
              size={40} 
              userName={user?.userName}
              imageUrl={user?.profilePicture}
              profileType={"user"}
            />
            <View style={styles.boxSearchComp}>
              <InputComp
                iconName="filter"
                placeholder="Busque partidas"
                width="100%"
              />
            </View>
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 8,
    columnGap: 10,
  },
  boxSearchComp: {
    flex: 1,
  },
});