import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import BackGroundComp from "@/components/BackGroundComp";
import { EditMatchesCard } from "@/components/EditMatchesCardComp";
import { HandleMatchComp } from "@/components/HandleMatchComp";
import { UseModalEditMatchs } from "@/libs/hooks/useEditMatchs";
import { MatchEditModal } from "@/components/MatchEditModal";
import MoreOptionsModalComp from "@/components/MoreOptionsModalComp";
import ReportReasonModal from "@/components/ReportReasonModal";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import AppText from "@/components/AppText";
import { useFocusEffect } from "@react-navigation/native";
import { Imatches } from "@/libs/interfaces/Imatches";
import { ModalDescription } from "@/components/ModalDescription";
import { useMyMatches } from "@/libs/hooks/useMyMatches";
import { updateMatch, deleteMatch } from "@/libs/auth/handleMyMatches";
import { getMatchById } from "@/libs/auth/handleMatch";
import { useUser } from "@/libs/storage/UserContext";
export default function gerenciarPartidas() {
  const { isDarkMode } = useTheme();

  const colors = isDarkMode ? Colors.dark.background : Colors.light.background;
  const themeStyles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      backgroundColor: isDarkMode
        ? Colors.dark.background
        : Colors.light.background,
    },
  });

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<Imatches | null>(null);
  const { user } = useUser();

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
  } = UseModalEditMatchs();

  const { matches, isLoading, isRefreshing, onRefresh, reloadFeed } =
    useMyMatches();

  const handleSaveMatch = async (updatedMatch: any) => {
    try {
      const dataToSend: any = {};

      if (updatedMatch.title) dataToSend.title = updatedMatch.title;
      if (updatedMatch.description)
        dataToSend.description = updatedMatch.description;
      if (updatedMatch.sport) dataToSend.sport = updatedMatch.sport;
      if (updatedMatch.maxPlayers)
        dataToSend.maxPlayers = Number(updatedMatch.maxPlayers);
      if (updatedMatch.teamNameA) dataToSend.teamNameA = updatedMatch.teamNameA;
      if (updatedMatch.teamNameB) dataToSend.teamNameB = updatedMatch.teamNameB;
      if (updatedMatch.location) dataToSend.location = updatedMatch.location;

      const dateValue = updatedMatch.matchDate || updatedMatch.MatchDate;
      if (dateValue) {
        const toISO = (str) => {
          if (!str) return str;
          const match = str.match(
            /(\d{2})\/(\d{2})\/(\d{4})\s*:?\s*(\d{2}):(\d{2})/,
          );
          if (!match) return str;
          const [, dia, mes, ano, hora, minuto] = match;
          const dateObj = new Date(
            Number(ano),
            Number(mes) - 1,
            Number(dia),
            Number(hora),
            Number(minuto),
          );
          if (isNaN(dateObj.getTime())) return str;
          return dateObj.toISOString();
        };
        const isoDate = toISO(dateValue);
        dataToSend.MatchDate = isoDate;
      }

      if (
        updatedMatch.teamAScore !== undefined &&
        updatedMatch.teamAScore !== null
      ) {
        dataToSend.teamAScore = Number(updatedMatch.teamAScore) || 0;
      }
      if (
        updatedMatch.teamBScore !== undefined &&
        updatedMatch.teamBScore !== null
      ) {
        dataToSend.teamBScore = Number(updatedMatch.teamBScore) || 0;
      }

      await updateMatch(updatedMatch.id, dataToSend);
      Alert.alert("Sucesso", "Partida atualizada com sucesso!");
      reloadFeed();
    } catch (error) {
      console.error("Erro ao salvar partida:", error);
      Alert.alert("Erro", "Erro ao atualizar a partida. Tente novamente.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      reloadFeed();
    }, [reloadFeed]),
  );

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
              <EditMatchesCard
                match={item}
                onPressJoinMatch={async () => {
                  try {
                    const matchDetail = await getMatchById(item.id);
                    openModalConfirmCard(matchDetail);
                  } catch (e) {
                    Alert.alert(
                      "Erro",
                      "Não foi possível carregar os jogadores da partida.",
                    );
                  }
                }}
                onPressDelete={() => {
                  setMatchToDelete(item);
                  setDeleteModalVisible(true);
                }}
                onPressInfos={() => useModal(item)}
                onReloadFeed={reloadFeed}
              />
            )}
            refreshing={isRefreshing}
            showsVerticalScrollIndicator={false}
            onRefresh={onRefresh}
          />
        )}

        <HandleMatchComp
          isVisible={visibleConfirmCard}
          onClose={closeModalConfirmCard}
          match={selectedMatch ?? undefined}
          onPressMoreInfos={openModalMoreInfosHandleModal}
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
        />

        <MatchEditModal
          visible={visible}
          onClose={closeModal}
          match={selectedMatch ?? undefined}
          onSave={handleSaveMatch}
        />
        <ModalDescription
          visible={visibleDescriptionMatch}
          onClose={closeDescriptionMatchModal}
          title={selectedMatch?.title}
          description={selectedMatch?.description}
        ></ModalDescription>
      </View>
      {/* Modal de confirmação de exclusão */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.7)",
          }}
        >
          <View
            style={{
              backgroundColor: colors,
              padding: 24,
              borderRadius: 12,
              alignItems: "center",
              width: "80%",
              paddingVertical: 36,
            }}
          >
            <AppText
              style={{
                fontSize: 22,
                marginBottom: 16,
                color: "white",
                textAlign: "center",
              }}
            >
              Deseja realmente apagar esta partida?
            </AppText>
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <SecondaryButton
                onPress={() => setDeleteModalVisible(false)}
                textSize={22}
                fontWeight={"500"}
                style={{ height: 60, width: "45%" }}
              >
                Cancelar
              </SecondaryButton>

              <PrimaryButton
                textSize={22}
                fontWeight={"500"}
                style={{ height: 60, width: "45%" }}
                onPress={() => {
                  setDeleteModalVisible(false);

                  if (!matchToDelete) return;
                  if (!user || !user.token) {
                    Alert.alert("Erro", "Usuário não autenticado.");
                    return;
                  }
                  deleteMatch(matchToDelete.id, user.token)
                    .then(() => reloadFeed())
                    .catch(() => {
                      Alert.alert(
                        "Erro",
                        "Não foi possível deletar a partida.",
                      );
                    });
                }}
              >
                Apagar
              </PrimaryButton>
            </View>
          </View>
        </View>
      </Modal>
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
