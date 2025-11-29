// ARQUIVO: apps/mobile/components/EventDetailsModal.tsx
import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../constants/Theme";
import { Colors } from "../constants/Colors";
import { IPost } from "@/libs/interfaces/Ipost";
import { Imatches } from "@/libs/interfaces/Imatches";

type EventDetailsModalProps = {
  visible: boolean;
  onClose: () => void;
  post?: IPost | null; 
  matches?: Imatches | null
};

export function EventDetailsModal({
  visible,
  onClose,
  post,
}: EventDetailsModalProps) {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  if (!post) {
    return null; 
  }

  const eventDate = post.eventDate ? new Date(post.eventDate) : null;
  const formattedDate = eventDate
    ? eventDate.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      })
    : "";
  const formattedTime = eventDate
    ? eventDate.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <Modal
      animationType="slide" 
      transparent={true} 
      visible={visible}
      onRequestClose={onClose} 
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
      />

      
      <View
        style={[styles.modalContent, { backgroundColor: theme.background }]}
      >
        <View style={[styles.handle, { backgroundColor: theme.gray }]} />

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Detalhes do Evento
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close-circle" size={30} color={theme.gray} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <Text style={[styles.postText, { color: theme.text }]}>
            {post.content}
          </Text>

          <View style={[styles.infoRow, { borderTopColor: theme.gray }]}>
            <Ionicons name="calendar-outline" size={24} color={theme.orange} />
            <View>
              <Text style={[styles.infoLabel, { color: theme.text }]}>
                Data
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {formattedDate}
              </Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderTopColor: theme.gray }]}>
            <Ionicons name="time-outline" size={24} color={theme.orange} />
            <View>
              <Text style={[styles.infoLabel, { color: theme.text }]}>
                Horário
              </Text>''
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {formattedTime}
              </Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderTopColor: theme.gray }]}>
            <Ionicons name="location-outline" size={24} color={theme.orange} />
            <View>
              <Text style={[styles.infoLabel, { color: theme.text }]}>
                Local
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {post.location}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
  },
  modalContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%", // Ocupa 60% da tela
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 50,
    height: 5,
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  body: {
    flex: 1,
  },
  postText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    borderTopWidth: 1,
    paddingVertical: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: "#888", // (Será sobrescrito pelo theme.text)
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
  },
});
