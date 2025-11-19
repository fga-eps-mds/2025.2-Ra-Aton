// ARQUIVO: apps/mobile/components/ReportReasonModal.tsx
import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useTheme } from "@/constants/Theme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeAreaView } from "react-native-safe-area-context";

import SpacerComp from "./SpacerComp";
import AppText from "./AppText";

const REPORT_REASONS = [
  {
    label: "Conteúdo de Ódio",
    value: "Discurso de ódio ou símbolos inadequados.",
  },
  {
    label: "Spam ou Fraude",
    value: "Postagem enganosa ou repetitiva (spam).",
  },
  {
    label: "Informação Falsa",
    value: "Propagação de notícias falsas (fake news).",
  },
  {
    label: "Nudez ou Assédio",
    value: "Conteúdo sexual explícito ou assédio.",
  },
  {
    label: "Outro Motivo",
    value: "Viola outras diretrizes da comunidade.",
  },
];

interface ReportReasonModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const ReportReasonModal: React.FC<ReportReasonModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
}) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const ModalComponent: React.ComponentType<any> =
    (Modal as any) ||
    function ({ visible, children }: any) {
      return visible
        ? React.createElement(React.Fragment, null, children)
        : null;
    };

  return (
    <ModalComponent
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <SafeAreaView style={styles.safeArea}>
          <Pressable
            style={[styles.modalContainer, { backgroundColor: theme.input }]}
            testID="modal-overlay"
          >
            <View style={[styles.handle, { backgroundColor: theme.gray }]} />

            <AppText style={[styles.title, { color: theme.text }]}>
              Reportar Postagem
            </AppText>
            <AppText style={[styles.subtitle, { color: theme.text }]}>
              Selecione o motivo da sua denúncia.
            </AppText>
            <SpacerComp height={10} />

            {REPORT_REASONS.map((option, index) => (
              <React.Fragment key={option.value}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    onSubmit(option.value);
                    onClose();
                  }}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={24}
                    color={"#D93E3E"}
                  />
                  <SpacerComp width={10} />

                  {/* 8. REUTILIZANDO 'AppText' e 'optionText' */}
                  <AppText style={[styles.optionText, { color: theme.text }]}>
                    {option.label}
                  </AppText>
                </TouchableOpacity>
                {index < REPORT_REASONS.length - 1 && (
                  // 9. REUTILIZANDO 'divider' e 'theme.gray'
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
  handle: {
    width: 50,
    height: 5,
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.8,
    marginTop: 4,
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

export default ReportReasonModal;
