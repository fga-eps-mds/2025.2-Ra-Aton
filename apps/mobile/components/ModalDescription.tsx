import React from "react";
import { Modal, View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";

interface ModalDescriptionProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function ModalDescription({
  visible,
  onClose,
  title,
  description,
}: ModalDescriptionProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container}>
          <Text style={styles.title}>{title || "Descrição da partida"}</Text>

          <ScrollView style={styles.scroll}>
            <Text style={styles.text}>
              {description && description.trim().length > 0
                ? description
                : "Nenhuma descrição foi adicionada para esta partida."}
            </Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    maxHeight: "70%",
    borderRadius: 20,
    padding: 16,
    backgroundColor: "#121212",
  },
  title: {
    fontFamily: Fonts.mainFont.dongleRegular,
    fontSize: 32,
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  scroll: {
    maxHeight: "90%",
  },
  text: {
    fontFamily: Fonts.mainFont.dongleRegular,
    fontSize: 22,
    color: "#DDD",
  },
});
