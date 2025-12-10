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
export default function GerenciarPartidas() {
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

      const dateValue = updatedMatch.MatchDate || updatedMatch.matchDate;
      if (dateValue) dataToSend.MatchDate = dateValue;

      if (updatedMatch.teamAScore != null)
        dataToSend.teamAScore = Number(updatedMatch.teamAScore) || 0;

      if (updatedMatch.teamBScore != null)
        dataToSend.teamBScore = Number(updatedMatch.teamBScore) || 0;

      await updateMatch(updatedMatch.id, dataToSend);
      reloadFeed();

      return { success: true };
    } catch (error: any) {
      // console.log("DEBUG RAW ERROR:", error);

      const responseData = error?.response?.data;
      // console.log("DEBUG BACKEND DATA:", responseData);

      if (responseData?.message) {
        if (responseData.message.toLowerCase().includes("data")) {
          return {
            success: false,
            field: "MatchDate",
            error: responseData.message,
          };
        }

        return {
          success: false,
          field: "general",
          error: responseData.message,
        };
      }

      if (String(error).toLowerCase().includes("date")) {
        return {
          success: false,
          field: "MatchDate",
          error: "Data inválida.",
        };
      }

      return {
        success: false,
        field: "general",
        error: "Não foi possível atualizar a partida.",
      };
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
                textSize={26}
                textWeight={600}
                style={{ height: 60, width: "45%" }}
              >
                Cancelar
              </SecondaryButton>

              <PrimaryButton
                textSize={26}
                textWeight={600}
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
