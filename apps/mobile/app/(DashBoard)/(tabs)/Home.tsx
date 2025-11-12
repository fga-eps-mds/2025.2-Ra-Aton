import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator } from "react-native";
import BackGroundComp from "@/components/BackGroundComp";
import SearchInputComp from "@/components/SearchInputComp";
import ProfileThumbnailComp from "@/components/ProfileThumbnailComp";
import SpacerComp from "@/components/SpacerComp";
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

  const abortRequestWeb = useRef<AbortController | null>(null); // o abort é realmente para cancelar minha requisição caso necessáirio
  const throttleRequest = useRef(0); // esse useRef é usado como um armazenador, vai ajudar na hora das renderizações
  const LIMIT = 10;

  const loadPage = useCallback(
    async (targetPage: number, append: boolean) => {
      if (isLoading) return;

      // Aborta requisição anterior antes de iniciar a nova (evita estados intermediários)
      abortRequestWeb.current?.abort();
      abortRequestWeb.current = new AbortController();
      setIsloading(true);

      try {
        const res = await getFeed({
          page: targetPage,
          limit: LIMIT,
          signal: abortRequestWeb.current?.signal,
        });
        console.log("[FEED]", res.meta, "itens:", res.data.length);
        setHasNextPage(res.meta?.hasNextPage ?? (res.data.length === LIMIT))
        setPage(res.meta?.page ?? targetPage);

        setPosts(prev => {
          if (!append) return res.data;

          const map = new Map<string, IPost>();
          [...prev, ...res.data].forEach(p => map.set(String(p.id), p));
          return Array.from(map.values());
        });
      }
      catch (err: any) {
        // Ignore cancelamento de requisição (AbortController) — acontece ao iniciar uma nova página ou cancelar antiga
        const isCanceled = err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED' || err?.message === 'canceled';
        if (isCanceled) {
          // não considera erro real
          return;
        }

        console.warn("Erro ao carregar o feed:", err);
      } finally {
        setIsloading(false);
      }
    },
    [isLoading]
  );

  useEffect(() => {
    loadPage(1, false);
    return () => abortRequestWeb.current?.abort();
  }, [loadPage]);

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadPage(1, false);
    setIsRefreshing(false);
  }, [loadPage]);

  // Infinite scroll com throttle
  const onEndReached = useCallback(() => {
    const now = Date.now();
    if (now - throttleRequest.current < 800) return; // throttle simples
    throttleRequest.current = now;

    if (!isLoading && hasNextPage) {
      loadPage(page + 1, true);
    }
  }, [isLoading, hasNextPage, page, loadPage]);


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

  const handleReport = () => {
    console.log(`Reportando post ${selectedPostId}`);
  };

  const openModalInfos = () => {
    setIsOptionsVisible(false);
    setShowModal(true);
  }
  const closeModalInfos = () => {
    setShowModal(false);
    setIsOptionsVisible(true);
  }


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
              <InputComp
                iconName="filter"
                placeholder="Busque partidas"
                width={'100%'}
              />
            </View>
          </View>
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
      <CommentsModalComp
        isVisible={isCommentsVisible}
        onClose={handleCloseComments}

      />
      <EventInfoModalComp
        visible={showModal}
        onClose={closeModalInfos}
      />

    </BackGroundComp>
  );
}
// styles
const styles = StyleSheet.create({
  containerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 8,
    columnGap: 10,
  },
  boxSearchComp: {
    flex: 1,
  },
});

