import { createContext, useContext, useState, useEffect } from "react";
import { 
  getUnreadNotificationsCount, 
  getUserNotifications, 
  markNotificationAsRead as apiMarkRead,
  markAllNotificationsAsRead as apiMarkAllRead,
  NotificationAPI 
} from "@/libs/auth/handleNotifications";

interface NotificationContextData {
  unreadCount: number;
  notifications: NotificationAPI[];
  loading: boolean;
  loadNotifications: () => Promise<void>;
  loadUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

export function NotificationProvider({ children }: any) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationAPI[]>([]);
  const [loading, setLoading] = useState(false);

  // Carrega apenas o contador (leve, para polling)
  async function loadUnreadCount() {
    try {
      const count = await getUnreadNotificationsCount();
      setUnreadCount(count);
    } catch (e) {
      // Silencioso para não poluir o log em polling
    }
  }

  // Carrega a lista completa (pesado, para a tela)
  async function loadNotifications() {
    setLoading(true);
    try {
      console.log("Buscando notificações na API...");
      const data = await getUserNotifications();
      console.log("Notificações recebidas:", data);

      if (Array.isArray(data)) {
        setNotifications(data);
        // Atualiza o contador baseado na lista real para garantir sincronia
        const unreadReal = data.filter(n => !n.readAt).length;
        setUnreadCount(unreadReal);
      } else {
        console.error("A API não retornou um array de notificações:", data);
        setNotifications([]); 
      }
    } catch (e) {
      console.error("Erro ao carregar lista de notificações:", e);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    // Update Otimista
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await apiMarkRead(id);
    } catch (error) {
      console.error(error);
      loadNotifications(); // Reverte em caso de erro
    }
  }

  async function markAllAsRead() {
    // Update Otimista
    setNotifications(prev => 
      prev.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
    );
    setUnreadCount(0);

    try {
      await apiMarkAllRead();
    } catch (error) {
      console.error(error);
      loadNotifications();
    }
  }

  // Polling a cada 15s apenas para o contador (badge)
  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 15000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ 
      unreadCount, 
      notifications, 
      loading,
      loadUnreadCount, 
      loadNotifications,
      markAsRead,
      markAllAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications deve ser usado dentro de um NotificationProvider");
  return context;
}