import React, { use, useCallback, useRef, useState } from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { router } from "expo-router";
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
      setIsloading(true);

      abortRequestWeb.current?.abort();
      abortRequestWeb.current = new AbortController();

      try {
        const res = await getFeed({
          page: targetPage,
          limit: LIMIT,
          signal: abortRequestWeb.current.signal,
        })
        setHasNextPage(res.meta?.hasNextPage ?? (res.data.length === LIMIT))
        setPage(res.meta?.page ?? targetPage);

        setPosts(prev => {
          if (!append) return res.data;

          const map = new Map<String, IPost>();
          [...prev, ...res.data].forEach(p => map.set(String(p.id), p));
          return Array.from(map.values());
        });
      }
      catch (err) {
        console.warn("Erro ao carregar o feed:", err);
      } finally {
        setIsloading(false);
      }
    },
    [isLoading, getFeed]
  );








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
    // TODO: Criar requisição na pasta libs/reports (CA5)
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
        data={FEED_DATA}
        keyExtractor={(item) => item.id}
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

