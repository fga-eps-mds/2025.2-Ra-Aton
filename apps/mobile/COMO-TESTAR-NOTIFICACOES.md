# 🧪 Como Testar Notificações - Guia Rápido

## 1️⃣ Instale o APK no Celular

Baixe o APK gerado pelo EAS Build e instale no seu celular Android.

## 2️⃣ Abra o App e Pegue o Token

1. Abra o app instalado
2. O app vai pedir permissão de notificações → **ACEITE**
3. Conecte o celular no computador via USB
4. Ative a **Depuração USB** no celular
5. No terminal, rode:

```bash
adb logcat | grep "Expo Push Token"
```

Você verá algo como:
```
📱 Expo Push Token: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

**Copie esse token!** Você vai precisar dele.

## 3️⃣ Envie uma Notificação de Teste

### Opção A: Usando a Ferramenta Oficial (MAIS FÁCIL)

1. Acesse: https://expo.dev/notifications
2. Cole o token que você copiou
3. Preencha:
   - **Title**: `Teste Ra-Aton 🎯`
   - **Message**: `Sua primeira notificação!`
   - **Data** (opcional): `{"userId": "123", "action": "test"}`
4. Clique em **"Send a Notification"**

### Opção B: Usando cURL

```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ExponentPushToken[SEU_TOKEN_AQUI]",
    "title": "Teste Ra-Aton 🎯",
    "body": "Sua primeira notificação!",
    "data": {
      "userId": "123",
      "action": "test"
    }
  }'
```

### Opção C: Notificação Local (dentro do app)

Adicione um botão em qualquer tela:

```tsx
import * as Notifications from 'expo-notifications';

<PrimaryButton
  onPress={async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Teste Local 🔔",
        body: 'Funcionou!',
        data: { test: true },
      },
      trigger: { seconds: 2 },
    });
  }}
  label="Testar Notificação"
/>
```

## 4️⃣ O Que Vai Acontecer

### 🟢 App em Primeiro Plano (aberto):
- Console mostra: `🔔 Notification received: {...}`
- Você pode mostrar um modal/alert customizado

### 🟡 App em Segundo Plano (minimizado):
- Notificação aparece na barra de notificações
- Ao tocar, o app abre

### 🔴 App Fechado:
- Notificação aparece na barra de notificações
- Ao tocar, o app abre com os dados da notificação

## 5️⃣ Verificar se Funcionou

### Ver logs em tempo real:
```bash
# Android
adb logcat | grep -E "Expo Push Token|Notification received"

# Ou use Metro bundler (se rodou expo start --dev-client):
# Os logs aparecem automaticamente no terminal
```

### Testar diferentes cenários:

1. **App aberto** → Envie notificação → Veja o log
2. **App minimizado** → Envie notificação → Veja na barra
3. **Toque na notificação** → App deve abrir

## 6️⃣ Próximos Passos

### Integrar com Backend

No `_layout.tsx`, já tem um TODO:

```tsx
useEffect(() => {
  if (expoPushToken) {
    // Enviar para o backend
    api.post('/users/push-token', { token: expoPushToken });
  }
}, [expoPushToken]);
```

Crie esse endpoint no backend para salvar o token associado ao usuário.

### Enviar Notificações do Backend

No servidor Node.js:

```typescript
import { Expo } from 'expo-server-sdk';

const expo = new Expo();

async function sendNotification(userToken: string, title: string, body: string) {
  const messages = [{
    to: userToken,
    sound: 'default',
    title,
    body,
    data: { /* dados extras */ },
  }];

  const chunks = expo.chunkPushNotifications(messages);
  
  for (const chunk of chunks) {
    await expo.sendPushNotificationsAsync(chunk);
  }
}
```

## 🐛 Troubleshooting

### "Permission denied"
→ Vá em Configurações → Apps → Ra-Aton → Notificações → Ative

### "Token não aparece"
→ Você está usando o **Development Build** (APK do EAS)? Expo Go não funciona!

### "Notificação não chega"
→ Verifique se o token está correto (começa com `ExponentPushToken[`)
→ Verifique o Firebase Console se há erros

### "App não abre ao tocar na notificação"
→ Normal no dev build, funciona melhor em produção

## ✅ Checklist Final

- [ ] APK instalado no celular físico
- [ ] Permissão de notificações aceita
- [ ] Token copiado do `adb logcat`
- [ ] Notificação de teste enviada via https://expo.dev/notifications
- [ ] Notificação recebida no celular
- [ ] App mostra log no console
- [ ] Testado com app em background
- [ ] Testado tocar na notificação

---

**Agora seu app está pronto para notificações! 🎉**

Próximo passo: Integrar o backend para enviar notificações automáticas quando:
- Alguém curtir um post
- Alguém comentar
- Novo evento criado
- Etc.
