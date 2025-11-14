// ARQUIVO: apps/mobile/app/_layout.tsx
import React, { useEffect } from 'react'
import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'

// 1. IMPORTAR O CLIENTE E O PROVEDOR
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// CORREÇÃO: Usando aliases de path
import { UserProvider } from '@/libs/storage/UserContext'
import { ThemeProvider } from '@/constants/Theme'
import { Fonts } from '@/constants/Fonts'

// Previne o auto-hide da splash screen
SplashScreen.preventAutoHideAsync()

// 2. CRIAR UMA INSTÂNCIA DO CLIENTE
const queryClient = new QueryClient()

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(Fonts)

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Esconde a splash screen quando as fontes estiverem prontas
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) {
    return null // Retorna null enquanto as fontes carregam
  }

  return (
    // 3. ENVELOPAR TODO O APP COM O PROVEDOR
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <SafeAreaProvider>
            <StatusBar style="auto" />
            <Stack
              screenOptions={{
                headerShown: false, // Remove o header de todas as telas
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(Auth)" />
              <Stack.Screen name="(DashBoard)" />
            </Stack>
          </SafeAreaProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}