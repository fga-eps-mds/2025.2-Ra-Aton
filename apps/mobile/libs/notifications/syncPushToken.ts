import { api_route } from '@/libs/auth/api';

/**
 * Sincroniza o token de notificação push com o backend
 * @param expoPushToken - Token Expo Push gerado
 * @param authToken - Token JWT do usuário autenticado
 * @returns Promise<boolean> - true se sincronizado com sucesso
 */
export async function syncPushToken(
  expoPushToken: string,
  authToken: string
): Promise<boolean> {
  try {
    await api_route.post(
      '/notifications/token',
      { token: expoPushToken },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    console.log('✅ Push token sincronizado com sucesso');
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro ao sincronizar push token:', message);
    return false;
  }
}

/**
 * Remove o token de notificação do backend (usado no logout)
 * @param authToken - Token JWT do usuário autenticado
 * @returns Promise<boolean> - true se removido com sucesso
 */
export async function removePushToken(authToken: string): Promise<boolean> {
  try {
    await api_route.delete('/notifications/token', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log('✅ Push token removido com sucesso');
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro ao remover push token:', message);
    return false;
  }
}
