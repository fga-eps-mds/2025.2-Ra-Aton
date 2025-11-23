# 📱 Testando Notificações - Passo a Passo

## ⚠️ IMPORTANTE: Você precisa do arquivo Firebase

Antes de gerar o build, **baixe o `google-services.json`**:

1. Acesse: [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Project Settings** (ícone de engrenagem)
4. Na aba **General**, desça até **Your apps**
5. Clique no app Android ou crie um novo
6. Baixe o arquivo `google-services.json`
7. **Coloque em**: `apps/mobile/google-services.json`

---

## 🚀 Gerando o Build de Desenvolvimento

### 1️⃣ Primeira vez? Instale EAS CLI
```bash
npm install -g eas-cli
eas login
```

### 2️⃣ Configure o projeto no EAS (só a primeira vez)
```bash
cd apps/mobile
eas build:configure
```

### 3️⃣ Gere o APK de desenvolvimento
```bash
cd apps/mobile
eas build --profile development --platform android
```

⏱️ **Tempo estimado**: 10-20 minutos (build na nuvem)

### 4️⃣ Baixe e instale o APK

Quando o build terminar:
- O EAS mostrará um link para download
- Baixe o APK no seu celular
- Instale (pode precisar permitir "Fontes desconhecidas")

---

## 🧪 Testando Notificações

### Teste 1: Token de Push
```tsx
// Em qualquer componente:
import { useNotifications } from '@/libs/notifications/useNotifications';

function MyComponent() {
  const { expoPushToken, notification } = useNotifications();
  
  console.log('Push Token:', expoPushToken);
  // Cole este token no backend ou use o Expo Push Tool
}
```

### Teste 2: Enviar notificação de teste

#### Opção A: Expo Push Tool (mais fácil)
1. Acesse: https://expo.dev/notifications
2. Cole o token que apareceu no console
3. Escreva título e mensagem
4. Clique em "Send a Notification"

#### Opção B: cURL (para testar backend)
```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "title": "Teste Ra-Aton",
    "body": "Sua primeira notificação!",
    "data": { "userId": "123" }
  }'
```

### Teste 3: Comportamentos

**App em foreground:**
- A notificação aparece no handler do `useNotifications`
- Você pode mostrar um modal/toast customizado

**App em background:**
- Notificação aparece na bandeja do Android
- Ao tocar, o app abre e chama `handleNotificationResponse`

**App fechado:**
- Igual ao background

---

## 🔍 Debug

### Ver logs do app:
```bash
# Android
adb logcat | grep ReactNativeJS

# Ou via Metro:
pnpm dev:dev-client
```

### Token não aparece?
```typescript
// Adicione logs em registerNotifications.ts:
console.log('🔔 Device:', Device.isDevice);
console.log('🔔 Permissions:', status);
console.log('🔔 Token:', token);
```

### Build falhou?
```bash
# Veja logs detalhados:
eas build:list
eas build:view [BUILD_ID]
```

---

## ✅ Checklist de Teste

- [ ] `google-services.json` está em `apps/mobile/`
- [ ] Build gerou sem erros
- [ ] APK instalado no celular
- [ ] App abre sem crashar
- [ ] Console mostra o `expoPushToken`
- [ ] Notificação enviada via Expo Push Tool chegou
- [ ] Notificação aparece em background
- [ ] Ao tocar na notificação, app abre
- [ ] `handleNotificationResponse` é chamado

---

## 🚨 Troubleshooting

### "Notifications permissions not granted"
```typescript
// No Android 13+, você precisa pedir permissão:
import * as Notifications from 'expo-notifications';

const { status } = await Notifications.requestPermissionsAsync();
console.log('Permission status:', status);
```

### "Token nulo"
- Você está no Expo Go? **Não funciona!** Só funciona no Development Build
- Verifique se `google-services.json` está presente
- Rebuilde o app: `pnpm build:dev:android`

### "Build falha com workspace error"
```bash
cd apps/mobile
pnpm prepare:eas  # Regenera yarn.lock
eas build --profile development --platform android
```

---

## 📚 Próximos Passos

1. **Integre com backend**: Envie o `expoPushToken` para sua API
2. **Salve no banco**: Associe token ao usuário logado
3. **Envie notificações**: Use biblioteca `expo-server-sdk` no backend
4. **Teste em produção**: `eas build --profile production --platform android`

---

## 🎯 Fluxo Completo

```
┌─────────────────────────────────────────────────────┐
│ 1. App abre → useNotifications hook                 │
│ 2. Registra notificações → pega token               │
│ 3. Envia token para backend → POST /users/token    │
│ 4. Backend salva token no banco                     │
│ 5. Evento acontece → backend envia notificação      │
│ 6. FCM entrega → celular mostra notificação        │
│ 7. Usuário toca → app abre com dados               │
└─────────────────────────────────────────────────────┘
```
