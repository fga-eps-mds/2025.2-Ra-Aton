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
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
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
import InputDateComp from "./InputDateComp";
import InputDateWebComp from "./InputDateWebComp";
type MatchEditModalProps = {
  visible: boolean;
  onClose: () => void;
  match?: Imatches | any;
  onSave?: (updatedMatch: any) => Promise<{
    success: boolean;
    error?: string;
    field?: string | null;
  }>;
};

export function MatchEditModal({
  visible,
  onClose,
  match,
  onSave,
}: MatchEditModalProps) {
  const [editData, setEditData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [dataInputValue, setDataInputValue] = useState("");

  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const styles = makeStyles(theme);

  const handleChangeDate = (event: any, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      setShowPicker(false);
      return;
    }

    const currentDate = selectedDate || tempDate;
    setTempDate(currentDate);
    setShowPicker(false);
    setShowTimePicker(true);
  };

  const handleChangeTime = (event: any, selectedTime?: Date) => {
    if (event.type === "dismissed") {
      setShowTimePicker(false);
      return;
    }

    const finalDate = new Date(tempDate);

    if (selectedTime) {
      finalDate.setHours(selectedTime.getHours());
      finalDate.setMinutes(selectedTime.getMinutes());
    }

    setShowTimePicker(false);

    setEditData((prev: any) => ({
      ...prev,
      MatchDate: finalDate.toISOString(),
    }));

    const dia = String(finalDate.getDate()).padStart(2, "0");
    const mes = String(finalDate.getMonth() + 1).padStart(2, "0");
    const ano = finalDate.getFullYear();
    const horas = String(finalDate.getHours()).padStart(2, "0");
    const minutos = String(finalDate.getMinutes()).padStart(2, "0");

    setDataInputValue(`${dia}/${mes}/${ano} ${horas}:${minutos}`);
  };

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

  useEffect(() => {
    if (match) {
      setFormErrors({});
      setEditData({
        title: match.title || "",
        description: match.description || "",
        sport: match.sport || "",
        maxPlayers: String(match.maxPlayers || ""),
        teamNameA: match.teamNameA || "",
        teamNameB: match.teamNameB || "",
        location: match.location || "",
        MatchDate: match.MatchDate || "",
        teamAScore: String(match.teamAScore || 0),
        teamBScore: String(match.teamBScore || 0),
      });

      setDataInputValue(formatarData(match.MatchDate));
    }
  }, [match, visible]);

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!editData.title || editData.title.length < 2) {
      errors.title = "Título deve ter no mínimo 2 caracteres.";
    }
    if (!editData.sport) errors.sport = "Informe o esporte.";
    if (!editData.location) errors.location = "Informe o local da partida.";
    if (!editData.MatchDate) errors.MatchDate = "Informe a data da partida.";
    if (editData.maxPlayers && Number(editData.maxPlayers) < 2) {
      errors.maxPlayers = "O número de participantes deve ser >= 2.";
    }
    if (editData.description && editData.description.length < 3) {
      errors.description = "Descrição deve ter no mínimo 3 caracteres.";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!onSave) return;

    if (!validate()) return;

    setIsLoading(true);
    setFormErrors({});

    try {
      const result = await onSave({
        ...match,
        ...editData,
        maxPlayers: Number(editData.maxPlayers),
      });

      if (!result.success) {
        setFormErrors({
          [result.field ?? "general"]: result.error ?? "Erro desconhecido",
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onClose();
    } catch (err: any) {
      setFormErrors({ general: "Erro ao salvar. Tente novamente." });
      setIsLoading(false);
    }
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
            keyboardShouldPersistTaps="always"
          >
            <InputComp
              label="Título"
              iconName="football"
              value={editData.title}
              onChangeText={(text) =>
                setEditData((prev: any) => ({ ...prev, title: text }))
              }
              placeholder="Nome da partida"
              status={!!formErrors.title}
              statusText={formErrors.title}
            />

            <DescricaoInput
              label="Descrição"
              value={editData.description}
              onChangeText={(text) =>
                setEditData((prev: any) => ({ ...prev, description: text }))
              }
              placeholder="Descreva a partida..."
              height={100}
              status={!!formErrors.description}
              statusText={formErrors.description}
            />

            <InputComp
              label="Esporte"
              iconName="person"
              value={editData.sport}
              onChangeText={(text) =>
                setEditData((prev: any) => ({ ...prev, sport: text }))
              }
              placeholder="Ex: Futebol, Basquete"
              status={!!formErrors.sport}
              statusText={formErrors.sport}
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
              status={!!formErrors.maxPlayers}
              statusText={formErrors.maxPlayers}
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

            {Platform.OS === "web" ? (
                  <InputDateWebComp
                  label="Data Início *"
                  value={editData.MatchDate ? editData.MatchDate.slice(0, 16) : ""}
                  onChange={(value) => {
                  const iso = new Date(value).toISOString();
                  setEditData((prev) => ({ ...prev, MatchDate: iso }));
                  setDataInputValue(formatarData(iso));
                }}
                status={!!formErrors.MatchDate}
                statusText={formErrors.MatchDate}
              />
            ) : (
              <InputDateComp
                label="Data de Início"
                value={dataInputValue}
                onPress={() => setShowPicker(true)}
                status={!!formErrors.MatchDate}
                statusText={formErrors.MatchDate}
              />
            )}



            <InputComp
              label="Local"
              iconName="location"
              value={editData.location}
              onChangeText={(text) =>
                setEditData((prev: any) => ({ ...prev, location: text }))
              }
              placeholder="Endereço da partida"
              status={!!formErrors.location}
              statusText={formErrors.location}
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
              textSize={26}
              textWeight={600}
            >
              Cancelar
            </SecondaryButton>
            <PrimaryButton
              onPress={handleSave}
              disabled={isLoading}
              style={styles.button}
              textSize={26}
              textWeight={600}
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </PrimaryButton>
          </View>
          {showPicker && (
            <DateTimePicker
              value={tempDate}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={handleChangeDate}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={tempDate}
              mode="time"
              is24Hour={true}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleChangeTime}
            />
          )}
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
      height: "85%",
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
      height: 50,
      width: "45%",
      paddingVertical: 12,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    
  });
