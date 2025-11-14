import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator, Text } from "react-native";
import BackGroundComp from "@/components/BackGroundComp";
import ProfileThumbnailComp from "@/components/ProfileThumbnailComp";
import PostCardComp from "@/components/PostCardComp";
import MoreOptionsModalComp from "@/components/MoreOptionsModalComp";
import CommentsModalComp from "@/components/CommentsModalComp";
import InputComp from "@/components/InputComp";
import { EventInfoModalComp } from "@/components/EventInfoModal";
import { IPost } from "@/libs/interfaces/Ipost";
import { getFeed } from "@/libs/auth/handleFeed";
import Spacer from "@/components/SpacerComp";

export default function HomeScreen() {
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsloading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const abortRequestWeb = useRef<AbortController | null>(null);
  const throttleRequest = useRef(0);
  const isLoadingRef = useRef(false);
  const LIMIT = 10;

  const setLoading = (v: boolean) => {
    isLoadingRef.current = v;
    setIsloading(v);
  };

  const loadPage = useCallback(async (targetPage: number, append: boolean) => {
    if (isLoadingRef.current) return;

    abortRequestWeb.current?.abort();
    abortRequestWeb.current = new AbortController();
    setLoading(true);

    try {
      const res = await getFeed({
        page: targetPage,
        limit: LIMIT,
        signal: abortRequestWeb.current?.signal,
      });

      const backendHasNext = res?.meta?.hasNextPage;
      let nextHasNextPage =
        typeof backendHasNext === "boolean"
          ? backendHasNext
          : Array.isArray(res?.data) && res.data.length === LIMIT;

      if (Array.isArray(res?.data) && res.data.length === 0 && targetPage > 1) {
        nextHasNextPage = false;
      }

      setHasNextPage(nextHasNextPage);
      setPage(res?.meta?.page ?? targetPage);

      setPosts((prev) => {
        const newData: IPost[] = Array.isArray(res?.data) ? res.data : [];
        if (!append) return newData;
        const map = new Map<string, IPost>();
        [...prev, ...newData].forEach((p) => map.set(String(p.id), p));
        return Array.from(map.values());
      });
    } catch (err: any) {
      const isCanceled =
        err?.name === "CanceledError" ||
        err?.code === "ERR_CANCELED" ||
        err?.message === "canceled";
      if (isCanceled) return;
      console.log("[GET /posts] status:", err?.response?.status);
      console.log("[GET /posts] data:", err?.response?.data);
      console.log(
        "[GET /posts] url:",
        err?.config?.baseURL + err?.config?.url,
        "params:",
        err?.config?.params
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(1, false);
    return () => abortRequestWeb.current?.abort();
  }, []);

  const onRefresh = useCallback(async () => {
    throttleRequest.current = 0;
    setIsRefreshing(true);
    await loadPage(1, false);
    setIsRefreshing(false);
  }, [loadPage]);

  const onEndReached = useCallback(() => {
    if (posts.length === 0) return;
    if (isLoadingRef.current || !hasNextPage) return;

    const now = Date.now();
    if (now - throttleRequest.current < 800) return;
    throttleRequest.current = now;

    loadPage(page + 1, true);
  }, [hasNextPage, posts.length, page, loadPage]);

  const handleOpenComments = (postId: string) => {
    setSelectedPostId(postId);
    setIsCommentsVisible(true);
  };
  const handleCloseComments = () => {
    setIsCommentsVisible(false);
    setSelectedPostId(null);
  };
  const handleCloseOptions = () => {
    setIsOptionsVisible(false);
    setSelectedPostId(null);
  };
  const handleOpenOptions = (postId: string) => {
    setSelectedPostId(postId);
    setIsOptionsVisible(true);
  };
  const handleReport = () => {};
  const openModalInfos = () => {
    setIsOptionsVisible(false);
    setShowModal(true);
  };
  const closeModalInfos = () => {
    setShowModal(false);
    setIsOptionsVisible(true);
  };

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
          />
        )}
        ListHeaderComponent={
          <View style={styles.containerHeader}>
            <ProfileThumbnailComp size={40} />
            <View style={styles.boxSearchComp}>
              <InputComp iconName="filter" placeholder="Busque partidas" width={"100%"} />
            </View>
          </View>
        }
        ListEmptyComponent={
          !isLoading && !isRefreshing ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <Text style={{color:'white'}}>Nenhuma publicação por aqui ainda.</Text>
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
        onClose={handleCloseOptions}
        onReport={handleReport}
        onInfos={openModalInfos}
      />
      <CommentsModalComp isVisible={isCommentsVisible} onClose={handleCloseComments} />
      <EventInfoModalComp visible={showModal} onClose={closeModalInfos} />
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
