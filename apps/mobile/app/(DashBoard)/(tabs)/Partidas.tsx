import React, { useCallback, useEffect } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import BackGroundComp from "@/components/BackGroundComp";
import { MatchesCard } from "@/components/MatchesCardComp";
import { HandleMatchComp } from "@/components/HandleMatchComp";
import { UseModalFeedMatchs } from "@/libs/hooks/useFeedMatchs";
import { MatchDetailsModal } from "@/components/MatchDetailsModal";
import MoreOptionsModalComp from "@/components/MoreOptionsModalComp";
import ReportReasonModal from "@/components/ReportReasonModal";
import { useFeedMatches } from "@/libs/hooks/useMatchesFunctions";
import { useFocusEffect } from "@react-navigation/native";
import { Imatches } from "@/libs/interfaces/Imatches";
import { ModalDescription } from "@/components/ModalDescription";

// --- NOVOS IMPORTS ---
import { useLocalSearchParams, useRouter } from "expo-router";
import { getMatchById } from "@/libs/auth/handleMatch";

export default function Partidas() {
  const { isDarkMode } = useTheme();
  const themeStyles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      backgroundColor: isDarkMode
        ? Colors.dark.background
        : Colors.light.background,
    },
  });

  const router = useRouter();
  const { matchId } = useLocalSearchParams();

  const {
    visibleConfirmCard,
    visible,
    visibleDetailsHandle,
    visibleInfosHandleMatch,
    visibleReportMatch,
    visibleDescriptionMatch,
    selectedMatch,
    useModal,
    closeModal,
    openDetailsHandleMatchModal,
    closeDetailsHandleMatchModal,
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

  const {
    matches,
    isLoading,
    isRefreshing,
    hasNextPage,
    onRefresh,
    reloadFeed,
    onEndReached,
    joinMatch,
    isUserSubscriped,
    switchTeam,
    leaveMatch,
  } = useFeedMatches();

  useFocusEffect(
    useCallback(() => {
      reloadFeed();
    }, [reloadFeed]),
  );

  useEffect(() => {
    const checkNotificationRedirect = async () => {
      if (matchId && typeof matchId === "string" && matchId !== "") {
        try {
          console.log("🔔 Abrindo partida via notificação:", matchId);
          
          // Busca os dados atualizados da partida
          const matchData = await getMatchById(matchId);
          
          if (matchData) {
            // Abre o modal HandleMatchComp com os dados carregados
            openModalConfirmCard(matchData);

            router.setParams({ matchId: "" });
          }
        } catch (error) {
          console.error("Erro ao carregar partida da notificação:", error);
        }
      }
    };

    checkNotificationRedirect();
  }, [matchId]);

  return (
    <BackGroundComp>
      <View style={[styles.container, themeStyles.container]}>
        {isLoading && matches.length === 0 ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={matches}
            keyExtractor={(item: Imatches) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <MatchesCard
                match={item}
                onPressInfos={() => useModal(item)}
                onPressJoinMatch={() => joinMatch(item, openModalConfirmCard)}
                onReloadFeed={reloadFeed}
                isUserSubscriped={isUserSubscriped(item)}
              />
            )}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.2}
            refreshing={isRefreshing}
            showsVerticalScrollIndicator={false}
            onRefresh={onRefresh}
            ListFooterComponent={
              isLoading && hasNextPage && matches.length > 0 ? (
                <ActivityIndicator style={{ marginVertical: 10 }} />
              ) : null
            }
          />
        )}

        <HandleMatchComp
          isVisible={visibleConfirmCard}
          onClose={closeModalConfirmCard}
          match={selectedMatch ?? undefined}
          onPressMoreInfos={openModalMoreInfosHandleModal}
          onSwitchTeam={
            selectedMatch
              ? () => switchTeam(selectedMatch, openModalConfirmCard)
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
              ? () =>
                  leaveMatch(selectedMatch, () => {
                    closeModalConfirmCard();
                  })
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
        ></ModalDescription>
      </View>
    </BackGroundComp>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 8,
  },
  listContent: {
    alignItems: "center",
    rowGap: 25,
    paddingVertical: 8,
  },
});