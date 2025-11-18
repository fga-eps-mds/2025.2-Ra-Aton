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
  onReport: () => void;
  onDelete?: () => void; // Opcional, se o usuário for dono do post
}

const MoreOptionsModalComp: React.FC<MoreOptionsModalProps> = ({
  isVisible,
  onClose,
  onReport,
  onInfos,
  onDelete,
}) => {
  const { isDarkMode } = useTheme();
  // Use a safe Modal fallback for test environments where RN's Modal may be
  // unavailable or mocked differently. This avoids crashing during render.
  const ModalComponent: React.ComponentType<any> =
    (Modal as any) ||
    function ({ visible, children }: any) {
      return visible
        ? React.createElement(React.Fragment, null, children)
        : null;
    };
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const modalOptions = [
    {
      label: "Reportar Post",
      icon: "alert-circle-outline",
      action: onReport,
      color: theme.danger || "#D93E3E", // TODO: Adicionar 'danger' em Colors.ts
    },
    {
      label: "Sobre o evento",
      icon: "information-circle",
      action: onInfos,
      color: theme.orange,
    },
    // Adiciona a opção de deletar se a função foi passada
    ...(onDelete
      ? [
          {
            label: "Excluir Post",
            icon: "trash-outline",
            action: onDelete,
            color: theme.danger || "#D93E3E",
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
                    option.action();
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
    justifyContent: "flex-end", // Alinha o modal na base
  },
  safeArea: {
    width: "100%",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30, // Espaço para safe area
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
