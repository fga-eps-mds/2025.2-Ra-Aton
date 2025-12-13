# 🔔 Sistema de Notificações - Ra-Aton Mobile

## 📋 Visão Geral

Este projeto está configurado com uma **estratégia híbrida** para notificações push:

- ✅ **Desenvolvedores de UI/UX**: Continuam usando **Expo Go** normalmente
- ✅ **Desenvolvedores de Notificações**: Usam **Development Build** para testar notificações reais

## 🚀 Setup Rápido

### Para Desenvolvedores de UI/UX (Expo Go)

```bash
# Na raiz do monorepo
pnpm dev:mobile

# Ou dentro de apps/mobile
pnpm dev
```

Escaneie o QR code com o Expo Go. O código de notificações vai detectar automaticamente que você está no Expo Go e não vai travar o app.

### Para Desenvolvedores de Notificações (Development Build)

#### 1. Configurar Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Crie ou selecione o projeto
3. Baixe o `google-services.json` (Android) ou `GoogleService-Info.plist` (iOS)
4. Coloque na raiz de `apps/mobile/`

#### 2. Configurar EAS (Uma Vez Por Máquina)

```bash
# Instalar EAS CLI globalmente
npm install -g eas-cli

# Fazer login (use a conta do time)
eas login

# Configurar o projeto
cd apps/mobile
eas build:configure
```

#### 3. Criar Development Build

**⚠️ IMPORTANTE: Monorepo Setup**

Como este é um monorepo com pnpm, mas o EAS Build funciona melhor com Yarn, você precisa gerar um `yarn.lock` primeiro:

```bash
cd apps/mobile

# Gerar yarn.lock (apenas primeira vez ou se package.json mudar)
corepack enable
yarn set version stable
yarn install
```

**Android:**
```bash
cd apps/mobile
eas build --profile development --platform android
```

Aguarde o build terminar (5-10 minutos). Baixe o APK e instale no seu celular.

**iOS (se tiver Mac):**
```bash
cd apps/mobile
eas build --profile development --platform ios
```

#### 4. Rodar com Development Build

```bash
cd apps/mobile
npx expo start --dev-client
```

Abra o app instalado no seu celular (não o Expo Go).

## 💻 Como Usar no Código

### No componente raiz (ex: `app/_layout.tsx`):

```tsx
import { useNotifications } from '@/libs/notifications/useNotifications';

export default function RootLayout() {
  const { expoPushToken, notification } = useNotifications();

  // expoPushToken será null no Expo Go, mas funcionará na Development Build
  // Envie esse token para o backend quando disponível

  return (
    // ... seu layout
  );
}
```

### Testando Notificações Localmente

```tsx
import * as Notifications from 'expo-notifications';

// Em qualquer lugar do código
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Teste 📬",
    body: 'Notificação funcionando!',
    data: { data: 'goes here' },
  },
  trigger: { seconds: 2 },
});
```

## 🔧 Estrutura dos Arquivos

```
apps/mobile/libs/notifications/
├── registerNotifications.ts  # Lógica de registro (com proteção para Expo Go)
└── useNotifications.ts       # Hook React para usar no app
```

## 📱 Fluxo de Trabalho do Time

### Grupo A (UI/UX, Telas, Navegação)
- ✅ Usa **Expo Go**
- ✅ Roda `pnpm dev:mobile`
- ⚠️ Verão aviso no console: `"Rodando no Expo Go: Notificações via Firebase podem não funcionar..."`
- ✅ O app **não trava**, continua funcionando normalmente

### Grupo B (Infraestrutura, Notificações, Firebase)
- ✅ Usa **Development Build**
- ✅ Roda `npx expo start --dev-client`
- ✅ Testa notificações reais do Firebase
- ✅ Integra com o backend

## 🐛 Troubleshooting

### "expo-notifications não está instalado"
```bash
cd apps/mobile
pnpm add expo-notifications expo-device expo-constants
```

### "Erro ao pegar token no Expo Go"
✅ Isso é esperado! O código está protegido e não vai travar o app.

### "Development Build não abre"
```bash
# Limpe o cache
cd apps/mobile
rm -rf .expo android/.gradle ios/Pods
npx expo start --dev-client --clear
```

### "google-services.json não encontrado"
1. Baixe do Firebase Console
2. Coloque em `apps/mobile/google-services.json`
3. Rebuilde: `eas build --profile development --platform android`

## 📚 Recursos

- [Documentação Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Guia de Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

## 🤝 Contribuindo

Ao adicionar novas features de notificações:

1. ✅ Sempre envolva chamadas de notificação em `try/catch`
2. ✅ Teste no Expo Go primeiro (deve não travar)
3. ✅ Teste na Development Build depois (deve funcionar 100%)
4. ✅ Documente comportamentos esperados

## 📞 Suporte

Dúvidas? Entre em contato com o time de infraestrutura ou abra uma issue no GitHub.
