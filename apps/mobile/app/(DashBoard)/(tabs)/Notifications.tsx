import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import BackGroundComp from "@/components/BackGroundComp";
import CardNotificationComp from "@/components/CardNotificationComp";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { useRouter, useFocusEffect } from "expo-router";

import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  NotificationAPI,
} from "@/libs/auth/handleNotifications";

import { useNotifications } from "@/libs/storage/NotificationContext";

export default function NotificationsScreen() {
  const [tab, setTab] = useState<"unread" | "all">("unread");
  const [notifications, setNotifications] = useState<NotificationAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Contexto para atualizar o badge do menu lateral e manter estado global
  const { loadUnread } = useNotifications();

  // Tipos de notificação que NÃO devem ter botão de redirecionamento
  const INFO_ONLY_TYPES = ['GROUP_JOIN_APPROVED', 'GROUP_JOIN_REJECTED', 'EVENT_REMINDER'];

  // --- BUSCAR DADOS ---
  const fetchNotifications = async () => {
    try {
      const data = await getUserNotifications();
      // Garante que é um array para evitar erros de renderização
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Recarrega a lista sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
    loadUnread();
  }, []);

  // --- LÓGICA DE AÇÃO AO CLICAR EM MARCAR COMO LIDA ---
  const handleMarkAsRead = async (id: string) => {
    try {
      // Update Otimista (Visual)
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n
        )
      );

      await markNotificationAsRead(id);
      loadUnread(); // Atualiza o badge global
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
      Alert.alert("Erro", "Não foi possível atualizar.");
      fetchNotifications(); // Rollback em caso de erro
    }
  };

  // --- LÓGICA DE AÇÃO AO CLICAR EM MARCAR TODAS ---
  const handleMarkAllAsRead = async () => {
    try {
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          readAt: n.readAt || new Date().toISOString(),
        }))
      );

      await markAllNotificationsAsRead();
      loadUnread();
    } catch (error) {
      console.error("Erro ao marcar todas:", error);
      Alert.alert("Erro", "Falha ao limpar notificações.");
    }
  };

  // --- LÓGICA DE NAVEGAÇÃO ---
  const handleNotificationPress = (notif: NotificationAPI) => {
    // Marca como lida automaticamente ao clicar em visualizar
    if (!notif.readAt) {
      handleMarkAsRead(notif.id);
    }

    switch (notif.resourceType) {
      case 'MATCH':
        router.push({
          pathname: "/(DashBoard)/(tabs)/Partidas",
          params: { matchId: notif.resourceId }
        });
        break;

      default:
        console.log("Notificação sem redirecionamento definido");
    }
  };

  // Filtro Visual da Lista
  const filteredNotifications = notifications.filter((notif) => {
    const isRead = !!notif.readAt;
    if (tab === "unread") return !isRead;
    return true;
  });

  return (
    <BackGroundComp>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.dark.orange}
          />
        }
      >
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

          <Pressable style={styles.allRead} onPress={handleMarkAllAsRead}>
            <Text style={styles.btnText}>Marcar todas como lidas</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.dark.orange}
            style={{ marginTop: 50 }}
          />
        ) : (
          <View style={styles.listContainer}>
            {filteredNotifications.length === 0 ? (
              <Text style={styles.emptyText}>
                {tab === "unread"
                  ? "Tudo lido por aqui!"
                  : "Nenhuma notificação encontrada."}
              </Text>
            ) : (
              filteredNotifications.map((item) => {
                // Verifica se deve mostrar o botão "Visualizar"
                const showViewButton = !INFO_ONLY_TYPES.includes(item.type);

                return (
                  <CardNotificationComp
                    key={item.id}
                    title={item.title}
                    description={item.content}
                    isRead={!!item.readAt}
                    onMarkAsRead={() => handleMarkAsRead(item.id)}
                    // Se for informativo, passa undefined para esconder o botão
                    onView={showViewButton ? () => handleNotificationPress(item) : undefined}
                  />
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </BackGroundComp>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 20, paddingBottom: 100 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  tabs: {
    flexDirection: "row",
    gap: 16,
  },
  tab: {
    fontSize: 20,
    color: Colors.dark.text,
    fontFamily: Fonts.mainFont.dongleRegular,
  },
  active: {
    fontWeight: "bold",
    textDecorationLine: "underline",
    color: Colors.dark.orange,
  },
  allRead: {
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderColor: Colors.dark.text,
    backgroundColor: Colors.dark.orange,
  },
  btnText: {
    fontSize: 18,
    color: Colors.dark.text,
    fontFamily: Fonts.mainFont.dongleRegular,
  },
  listContainer: {
    gap: 12,
  },
  emptyText: {
    fontSize: 22,
    color: Colors.dark.text,
    fontFamily: Fonts.mainFont.dongleRegular,
    textAlign: "center",
    marginTop: 40,
    opacity: 0.6,
  },
});