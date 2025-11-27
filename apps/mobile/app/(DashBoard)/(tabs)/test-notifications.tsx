import { View, StyleSheet, Platform } from 'react-native';
import PrimaryButton from '@/components/PrimaryButton';

let Notifications: typeof import('expo-notifications') | null = null;
if (Platform.OS !== 'web') {
  Notifications = require('expo-notifications');
}

export default function TestNotifications() {
  const sendLocalNotification = async () => {
    if (!Notifications) {
      console.log('Notificações não suportadas nesta plataforma');
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Teste Local 🔔",
        body: 'Notificação funcionando!',
        data: { userId: '123', action: 'test' },
      },
      trigger: { seconds: 2 },
    });
  };

  const sendImmediateNotification = async () => {
    if (!Notifications) {
      console.log('Notificações não suportadas nesta plataforma');
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Notificação Imediata ⚡",
        body: 'Apareceu instantaneamente!',
        data: { test: true },
      },
      trigger: null, // Imediata
    });
  };

  return (
    <View style={styles.container}>
      <PrimaryButton
        onPress={sendLocalNotification}
        label="Testar em 2 segundos"
      />
      
      <View style={{ height: 20 }} />
      
      <PrimaryButton
        onPress={sendImmediateNotification}
        label="Testar agora"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});
