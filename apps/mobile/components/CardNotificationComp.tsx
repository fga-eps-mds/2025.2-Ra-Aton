import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";

interface CardNotificationCompProps {
  title: string;
  description: string;
  isRead: boolean;
  onMarkAsRead: () => void;
  onView?: () => void; // <--- 1. Tornar opcional (?)
}

const CardNotificationComp: React.FC<CardNotificationCompProps> = ({
  title,
  description,
  isRead,
  onMarkAsRead,
  onView,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{description}</Text>

      <View style={styles.actions}>
        {!isRead && (
          <Pressable style={styles.btn} onPress={onMarkAsRead}>
            <Text style={styles.btnText}>Marcar como lida</Text>
          </Pressable>
        )}

        {/* 2. Só renderiza o botão se onView existir */}
        {onView && (
          <Pressable style={[styles.btn, styles.viewBtn]} onPress={onView}>
            <Text style={styles.btnText}>Visualizar</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.dark.gray,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark.text,
    fontFamily: Fonts.mainFont.dongleRegular,
  },
  desc: {
    fontSize: 18,
    color: Colors.dark.text,
    fontFamily: Fonts.mainFont.dongleRegular,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
  },
  btn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.dark.input,
  },
  btnText: {
    fontSize: 18,
    color: Colors.dark.text,
    fontFamily: Fonts.mainFont.dongleRegular,
  },
  viewBtn: {
    backgroundColor: Colors.light.orange,
  },
});

export default CardNotificationComp;