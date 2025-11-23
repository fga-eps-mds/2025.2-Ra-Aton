import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

/**
 * Configura e registra o dispositivo para receber notificações push.
 * 
 * ESTRATÉGIA HÍBRIDA:
 * - Funciona no Expo Go (com aviso no console)
 * - Funciona perfeitamente na Development Build com Firebase configurado
 * 
 * @returns O token de notificação ou null se não for possível obter
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // 1. Verificação de Segurança: Estamos no Expo Go?
  // O Expo Go não tem o 'google-services.json' embutido corretamente para o seu projeto.
  const isExpoGo = Constants.appOwnership === 'expo';

  if (isExpoGo) {
    console.log("⚠️ Rodando no Expo Go: Notificações via Firebase podem não funcionar como esperado.");
    console.log("💡 Para testar notificações completas, use: npx expo run:android --variant debug");
    // Retorna null para não travar o resto do app
    return null;
  }

  let token: string | null = null;
  
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('❌ Sem permissão para notificações!');
      return null;
    }

    // Tenta pegar o token. Se falhar (comum no Expo Go configurado incorretamente), não trava o app.
    try {
      // projectId é necessário se vocês já tiverem configurado o EAS no app.json
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: projectId, // Importante para garantir que o token seja do projeto certo
      })).data;
      
      console.log("✅ Token de notificação gerado:", token);
    } catch (error) {
      console.log("⚠️ Erro ao pegar token (provavelmente você está no Expo Go sem config nativa):", error);
      return null;
    }

  } else {
    console.log('📱 Use um dispositivo físico para testar notificações.');
    return null;
  }

  return token;
}

/**
 * Configura como as notificações devem ser apresentadas quando o app está aberto
 */
export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}
