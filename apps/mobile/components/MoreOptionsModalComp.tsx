import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable, // Permite fechar ao clicar fora
  SafeAreaView,
} from "react-native";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import SpacerComp from "./SpacerComp";

interface MoreOptionsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onInfos?: () => void;
  onInfosMatch?: () => void;
  onReport?: () => void;
  onDetailsMatch?: () => void;
  onDelete?: () => void;
  onLeaveMatch?: () => void;
}

const MoreOptionsModalComp: React.FC<MoreOptionsModalProps> = ({
  isVisible,
  onClose,
  onInfosMatch,
  onReport,
  onInfos,
  onDelete,
  onDetailsMatch,
  onLeaveMatch,
}) => {
  const { isDarkMode } = useTheme();

  const ModalComponent: React.ComponentType<any> =
    (Modal as any) ||
    function ({ visible, children }: any) {
      return visible
        ? React.createElement(React.Fragment, null, children)
        : null;
    };
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const modalOptions = [
    ...(onDetailsMatch
      ? [
          {
            label: "Descrição da partida",
            icon: "reader-outline",
            action: onDetailsMatch,
            color: theme.orange,
          },
        ]
      : []),

    ...(onReport
      ? [
          {
            label: "Reportar Post",
            icon: "alert-circle-outline",
            action: onReport,
            color: "#D93E3E",
          },
        ]
      : []),

    // CORREÇÃO: Verifica se onInfos existe antes de adicionar a opção
    ...(onInfos
      ? [
          {
            label: "Sobre o evento",
            icon: "information-circle",
            action: onInfos,
            color: theme.orange,
          },
        ]
      : []),

    ...(onDelete
      ? [
          {
            label: "Excluir Post",
            icon: "trash-outline",
            action: onDelete,
            color: "#D93E3E",
          },
        ]
      : []),

    ...(onInfosMatch
      ? [
          {
            label: "Reportar Partida",
            icon: "alert-circle-outline",
            action: onInfosMatch,
            color: "#D93E3E",
          },
        ]
      : []),

    ...(onLeaveMatch
      ? [
          {
            label: "Abandonar partida",
            icon: "log-out-outline",
            action: onLeaveMatch,
            color: "#D93E3E",
          },
        ]
      : []),
  ];

  return (
    <ModalComponent
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay para fechar ao clicar fora */}
      <Pressable style={styles.overlay} onPress={onClose}>
        <SafeAreaView style={styles.safeArea}>
          {/* Previne que o clique no conteúdo feche o modal */}
          <Pressable
            style={[styles.modalContainer, { backgroundColor: theme.input }]}
          >
            {modalOptions.map((option, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    if (option.action) {
                      option.action();
                    }
                    onClose();
                  }}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color={option.color}
                  />
                  <SpacerComp width={10} />
                  <Text style={[styles.optionText, { color: option.color }]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
                {index < modalOptions.length - 1 && (
                  <View
                    style={[styles.divider, { backgroundColor: theme.gray }]}
                  />
                )}
              </React.Fragment>
            ))}
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </ModalComponent>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  safeArea: {
    width: "100%",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  optionText: {
    fontSize: 18,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    width: "100%",
  },
});

export default MoreOptionsModalComp;