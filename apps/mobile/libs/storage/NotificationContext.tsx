import { createContext, useContext, useState, useEffect } from "react";

// Defina o formato do contexto
interface NotificationContextData {
  unreadCount: number;
  loadUnread: () => Promise<void>;
}

// Inicie com um valor padrão seguro em vez de null
const NotificationContext = createContext<NotificationContextData>({
  unreadCount: 0,
  loadUnread: async () => { },
});

export function NotificationProvider({ children }: any) {
  const [unreadCount, setUnreadCount] = useState(0);

  async function loadUnread() {
    try {
      const response = await fetch("http://localhost:4000/notifications/unread-count");
      const data = await response.json();
      setUnreadCount(0);
      console.log("Notificações não lidas:", data.count);
    } catch (e) {
      console.log("Erro ao carregar notificações", e);
    }
  }

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 10000); // atualiza a cada 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, loadUnread }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
