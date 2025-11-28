import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useState } from "react";

export default function NotificationsScreen() {
  const [tab, setTab] = useState<"unread" | "all">("unread");
  
  return (
    <Backgroun
    <ScrollView contentContainerStyle={styles.container}>
      {/* TOP BAR */}
      <View style={styles.header}>
        <View style={styles.tabs}>
          <Pressable onPress={() => setTab("unread")}>
            <Text style={[styles.tab, tab === "unread" && styles.active]}>
              Não lidas
            </Text>
          </Pressable>

          <Pressable onPress={() => setTab("all")}>
            <Text style={[styles.tab, tab === "all" && styles.active]}>
              Todas
            </Text>
          </Pressable>
        </View>

        <Pressable style={styles.allRead}>
          <Text>Marcar todas como lida</Text>
        </Pressable>
      </View>

      {/* EXEMPLO DE CARD */}
      <View style={styles.card}>
        <Text style={styles.title}>Título da notificação</Text>
        <Text style={styles.desc}>Descrição da notificação...</Text>

        <View style={styles.actions}>
          <Pressable style={styles.btn}>
            <Text>Marcar como lida</Text>
          </Pressable>

          <Pressable style={[styles.btn, styles.viewBtn]}>
            <Text>Visualizar</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabs: {
    flexDirection: "row",
    gap: 16,
  },
  tab: {
    fontSize: 16,
  },
  active: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  allRead: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
  },
  card: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  desc: {
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  btn: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
  },
  viewBtn: {
    backgroundColor: ,
  },
});
