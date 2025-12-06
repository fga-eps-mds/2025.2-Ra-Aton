import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Button,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Imatches } from "@/libs/interfaces/Imatches";
import { Fonts } from "@/constants/Fonts";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/constants/Theme";
import InputComp from "./InputComp";
import { DescricaoInput } from "./DescricaoInput";
import PrimaryButton from "./PrimaryButton";
import AppText from "./AppText";
import SecondaryButton from "@/components/SecondaryButton";

type MatchEditModalProps = {
  visible: boolean;
  onClose: () => void;
  match?: Imatches | any;
  onSave?: (updatedMatch: any) => Promise<void>;
};

export function MatchEditModal({
  visible,
  onClose,
  match,
  onSave,
}: MatchEditModalProps) {
  const [editData, setEditData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [dataInputValue, setDataInputValue] = useState("");

  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);

  const formatarData = (dataISO: string | undefined) => {
    if (!dataISO) return "";

    const data = new Date(dataISO.replace(" ", "T"));
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, "0");
    const minutos = String(data.getMinutes()).padStart(2, "0");

    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
  };

  const desformatarDataParaISO = (str: string) => {
    if (!str || !str.includes(" ")) return "";
    const [datePart, timePart] = str.split(" ");
    const [day, month, year] = datePart.split("/");
    const date = new Date(`${year}-${month}-${day}T${timePart}:00`);
    if (isNaN(date.getTime())) return "";
    return date.toISOString();
  };

  useEffect(() => {
    if (match) {
      setEditData({
        title: match.title || "",
        description: match.description || "",
        sport: match.sport || "",
        maxPlayers: String(match.maxPlayers || ""),
        teamNameA: match.teamNameA || "Time A",
        teamNameB: match.teamNameB || "Time B",
        location: match.location || "",
        MatchDate: match.MatchDate || "",
        teamAScore: String(match.teamAScore || 0),
        teamBScore: String(match.teamBScore || 0),
      });
      setDataInputValue(formatarData(match.MatchDate) || "");
    }
  }, [match, visible]);

  const handleSave = async () => {
    if (!onSave) return;

    setIsLoading(true);
    try {
      await onSave({
        ...match,
        ...editData,
        maxPlayers: Number(editData.maxPlayers),
      });
      onClose();
    } catch (error) {
      console.error("Erro ao salvar partida:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!match) return null;

  const handleDataChange = (text: string) => {
    setDataInputValue(text);
    const isoData = desformatarDataParaISO(text);
    setEditData((prev: any) => ({ ...prev, MatchDate: isoData }));
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <AppText style={styles.title}>Editar Partida</AppText>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={28} color="white" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <InputComp
              label="Título"
              iconName="football"
              value={editData.title}
              onChangeText={(text) =>
                setEditData((prev: any) => ({ ...prev, title: text }))
              }
              placeholder="Nome da partida"
            />

            <DescricaoInput
              label="Descrição"
              value={editData.description}
              onChangeText={(text) =>
                setEditData((prev: any) => ({ ...prev, description: text }))
              }
              placeholder="Descreva a partida..."
              height={100}
            />

            <InputComp
              label="Esporte"
              iconName="person"
              value={editData.sport}
              onChangeText={(text) =>
                setEditData((prev: any) => ({ ...prev, sport: text }))
              }
              placeholder="Ex: Futebol, Basquete"
            />

            <InputComp
              label="Número de Participantes"
              iconName="people"
              value={editData.maxPlayers}
              onChangeText={(text) => {
                const onlyNumbers = text.replace(/[^0-9]/g, "");
                setEditData((prev: any) => ({
                  ...prev,
                  maxPlayers: onlyNumbers,
                }));
              }}
              placeholder="Ex: 10"
              keyboardType="numeric"
            />

            <InputComp
              label="Nome da Equipe 1"
              iconName="people"
              value={editData.teamNameA}
              onChangeText={(text) =>
                setEditData((prev: any) => ({ ...prev, teamNameA: text }))
              }
              placeholder="Equipe 1"
            />

            <InputComp
              label="Nome da Equipe 2"
              iconName="people"
              value={editData.teamNameB}
              onChangeText={(text) =>
                setEditData((prev: any) => ({ ...prev, teamNameB: text }))
              }
              placeholder="Equipe 2"
            />

            <InputComp
              label="Data de Início"
              iconName="calendar"
              value={dataInputValue}
              onChangeText={handleDataChange}
              placeholder="dd/mm/aaaa : hh/mm"
            />

            <InputComp
              label="Local"
              iconName="location"
              value={editData.location}
              onChangeText={(text) =>
                setEditData((prev: any) => ({ ...prev, location: text }))
              }
              placeholder="Endereço da partida"
            />

            <InputComp
              label="Pontuação - Equipe 1"
              iconName="trophy"
              value={editData.teamAScore}
              onChangeText={(text) => {
                const onlyNumbers = text.replace(/[^0-9]/g, "");
                setEditData((prev: any) => ({
                  ...prev,
                  teamAScore: onlyNumbers,
                }));
              }}
              placeholder="0"
              keyboardType="numeric"
            />

            <InputComp
              label="Pontuação - Equipe 2"
              iconName="trophy"
              value={editData.teamBScore}
              onChangeText={(text) => {
                const onlyNumbers = text.replace(/[^0-9]/g, "");
                setEditData((prev: any) => ({
                  ...prev,
                  teamBScore: onlyNumbers,
                }));
              }}
              placeholder="0"
              keyboardType="numeric"
            />
          </ScrollView>

          <View style={styles.actions}>
            <SecondaryButton
              onPress={onClose}
              disabled={isLoading}
              style={styles.button}
              textSize={22}
            >
              Cancelar
            </SecondaryButton>
            <PrimaryButton
              onPress={handleSave}
              disabled={isLoading}
              style={styles.button}
              textSize={22}
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </PrimaryButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      zIndex: 0,
    },
    modalContainer: {
      width: "90%",
      maxHeight: "85%",
      backgroundColor: theme.background,
      borderRadius: 20,
      zIndex: 2,
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: Colors.light.orange,
    },
    title: {
      fontSize: 28,
      color: "white",
      fontFamily: Fonts.mainFont.dongleRegular,
      fontWeight: 500,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: Colors.light.orange,
    },
    button: {
      height: "100%",
      width: "45%",
      paddingVertical: 12,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
  });
