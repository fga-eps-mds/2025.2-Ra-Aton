import { useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import { registerForPushNotificationsAsync, setupNotificationHandler } from './registerNotifications';

// Importação condicional para evitar erros na Web
let Notifications: typeof import('expo-notifications') | null = null;

if (Platform.OS !== 'web') {
  Notifications = require('expo-notifications');
}

// Tipo genérico para notificação que funciona em todas as plataformas
type NotificationType = typeof Notifications extends null ? null : import('expo-notifications').Notification;

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
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const notificationListener = useRef<any>(undefined);
  const responseListener = useRef<any>(undefined);

  useEffect(() => {
    // Não configura notificações na Web
    if (Platform.OS === 'web' || !Notifications) {
      console.log('ℹ️ Notificações desabilitadas na versão Web');
      return;
    }

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
      setNotification(notification as NotificationType);
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
