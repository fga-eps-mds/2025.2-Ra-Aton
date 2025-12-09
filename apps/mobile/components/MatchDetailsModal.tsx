import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Imatches } from "@/libs/interfaces/Imatches";
import { Fonts } from "@/constants/Fonts";
import { Colors } from "@/constants/Colors";

type MatchDetailsModalProps = {
  visible: boolean;
  onClose: () => void;
  match?: Imatches | any;
};

export function MatchDetailsModal({
  visible,
  onClose,
  match,
}: MatchDetailsModalProps) {
  if (!match) return null;
  const matchDate = match?.MatchDate ? new Date(match.MatchDate) : null;

  const formattedDate = matchDate
    ? matchDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    : "--/--/----";

  const formattedTime = matchDate
    ? matchDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
    : "--:--";


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
          <Text style={styles.title}>Detalhes da Partida</Text>

          <View style={styles.infoRow}>
            <Ionicons name="football" size={20} color={Colors.light.orange} />
            <Text style={styles.infoText} numberOfLines={1}>
              {match.sport || ""}
            </Text>
          </View>

          <View style={styles.largeInfoRow}>
            <Ionicons name="book" size={20} color={Colors.light.orange} style={{ marginTop: 8 }}/>

            <ScrollView
              nestedScrollEnabled
              style={styles.scroll}
              contentContainerStyle={{ paddingRight: 5 }}
            >
              <Text style={styles.largeInfoText}>
                {match.description || ""}
              </Text>
            </ScrollView>
          </View>


          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={Colors.light.orange} />
            <Text style={styles.infoText} numberOfLines={1}>
              {match.location || ""}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={Colors.light.orange} />
            <Text style={styles.infoText}>
              {formattedDate}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color={Colors.light.orange} />
            <Text style={styles.infoText}>
              {formattedTime}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    width: '85%',
    maxWidth: 340,
    backgroundColor: "#121212",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 15,
    zIndex: 2,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: Fonts.mainFont.dongleRegular
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.orange,
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginBottom: 12,
    backgroundColor: "transparent",
  },
  largeInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: Colors.light.orange,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginBottom: 12,
    backgroundColor: "transparent",
    height: 150,
  },

  scroll: {
    marginLeft: 10,
    height: '100%',
  },

  largeInfoText: {
    fontWeight: "500",
    fontFamily: Fonts.mainFont.dongleRegular,
    color: "#CCCCCC",
    fontSize: 24,
  },


  infoText: {
    fontFamily: Fonts.mainFont.dongleRegular,
    color: "#CCCCCC",
    fontSize: 24,
    marginLeft: 10,
    fontWeight: "500",
    flex: 1,
  },
});