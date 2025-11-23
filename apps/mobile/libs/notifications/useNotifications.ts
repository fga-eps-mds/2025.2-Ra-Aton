import { useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, setupNotificationHandler } from './registerNotifications';

/**
 * Hook para gerenciar notificações no app
 * 
 * Uso:
 * ```tsx
 * const { expoPushToken, notification } = useNotifications();
 * 
 * // Envie expoPushToken para o backend para enviar notificações para este dispositivo
 * ```
 */
export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription | undefined>();
  const responseListener = useRef<Notifications.Subscription | undefined>();

  useEffect(() => {
    // Configura o handler de notificações
    setupNotificationHandler();

    // Registra para notificações push
    registerForPushNotificationsAsync()
      .then(token => {
        if (token) {
          setExpoPushToken(token);
          // TODO: Enviar token para o backend
          console.log('📤 Envie este token para o backend:', token);
        }
      })
      .catch(error => {
        console.error('Erro ao registrar notificações:', error);
      });

    // Listener para quando uma notificação é recebida enquanto o app está aberto
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      console.log('🔔 Notificação recebida:', notification);
    });

    // Listener para quando o usuário toca na notificação
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Usuário tocou na notificação:', response);
      // TODO: Navegar para a tela específica baseada no response.notification.request.content.data
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
}
