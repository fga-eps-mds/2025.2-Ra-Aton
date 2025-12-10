// Exemplo de como integrar notificações no seu app
// Copie este código para seu app/_layout.tsx

import { useEffect } from 'react';
import { useNotifications } from '@/libs/notifications/useNotifications';

export default function RootLayout() {
  const { expoPushToken, notification } = useNotifications();

  useEffect(() => {
    if (expoPushToken) {
      // TODO: Envie o token para o backend
      // fetch('https://seu-backend.com/api/users/push-token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token: expoPushToken }),
      // });
      
      console.log('✅ Token de Push disponível:', expoPushToken);
    }
  }, [expoPushToken]);

  useEffect(() => {
    if (notification) {
      console.log('🔔 Nova notificação recebida:', notification);
      
      // TODO: Navegue para tela específica baseado no conteúdo
      // const data = notification.request.content.data;
      // if (data.screen === 'profile') {
      //   router.push('/profile');
      // }
    }
  }, [notification]);

  return (
    // ... seu layout normal
    <div>Seu App</div>
  );
}
