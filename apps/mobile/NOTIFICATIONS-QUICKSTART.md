# 📱 Comandos Rápidos - Notificações

## 🚀 Para Desenvolvedores Usando Expo Go

```bash
# Na raiz do monorepo
pnpm dev:mobile

# Ou dentro de apps/mobile
cd apps/mobile
pnpm dev
```

Escaneie o QR code com o Expo Go. O app vai funcionar normalmente, mas notificações push não funcionarão completamente (isso é esperado).

## 🔨 Para Desenvolvedores Testando Notificações (Development Build)

### Primeira vez (Setup único):

```bash
# 1. Instalar EAS CLI globalmente
npm install -g eas-cli

# 2. Login
eas login

# 3. Configurar projeto (dentro de apps/mobile)
cd apps/mobile
eas build:configure
```

### Build Android (Development):

```bash
cd apps/mobile

# Criar APK de desenvolvimento
eas build --profile development --platform android

# Aguarde o build terminar e baixe o APK no seu celular
```

### Rodar Development Build:

```bash
cd apps/mobile

# Start com dev client (não Expo Go!)
pnpm dev:dev-client
```

Abra o app instalado no celular (aquele que você baixou do EAS Build).

## 🧪 Testar Notificação Local

No código do app:

```tsx
import * as Notifications from 'expo-notifications';

await Notifications.scheduleNotificationAsync({
  content: {
    title: "Teste 🔔",
    body: 'Funcionou!',
  },
  trigger: { seconds: 2 },
});
```

## 📚 Documentação Completa

Veja [`libs/notifications/README.md`](./libs/notifications/README.md) para guia completo.

## 🐛 Problemas Comuns

### "Expo Go não mostra notificações"
✅ Esperado! Use Development Build para testar notificações reais.

### "Erro ao buildar"
```bash
cd apps/mobile
rm -rf .expo android/.gradle
eas build --profile development --platform android --clear-cache
```

### "google-services.json não encontrado"
1. Baixe do Firebase Console
2. Coloque em `apps/mobile/google-services.json`
3. Rebuilde com EAS
