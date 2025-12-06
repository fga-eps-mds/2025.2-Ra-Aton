import Constants from 'expo-constants';

/**
 * Configurações do ambiente
 * 
 * As variáveis de ambiente são carregadas de .env.local (não commitado)
 * e podem ser acessadas via Constants.expoConfig.extra
 */

// Variáveis públicas do Expo (EXPO_PUBLIC_*)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
const ENV = process.env.EXPO_PUBLIC_ENV || 'development';

/**
 * URL base da API
 * Configurada no arquivo .env.local de cada desenvolvedor
 */
export const config = {
  /**
   * URL base da API
   * @example 'http://192.168.1.100:4000'
   */
  apiUrl: API_URL,

  /**
   * Ambiente atual
   * @example 'development' | 'production'
   */
  env: ENV,

  /**
   * Verifica se está em desenvolvimento
   */
  isDevelopment: ENV === 'development',

  /**
   * Verifica se está em produção
   */
  isProduction: ENV === 'production',

  /**
   * Informações do Expo
   */
  expo: {
    version: Constants.expoConfig?.version,
    name: Constants.expoConfig?.name,
  },
} as const;

/**
 * Loga as configurações atuais (útil para debug)
 */
export function logConfig() {
  console.log('📝 Configurações do App:');
  console.log('  - API URL:', config.apiUrl);
  console.log('  - Ambiente:', config.env);
  console.log('  - Versão:', config.expo.version);
  
  if (config.apiUrl.includes('localhost')) {
    console.warn('⚠️  Usando localhost - isto só funciona no emulador!');
    console.warn('   Para testar no celular físico, configure seu IP em .env.local');
  }
}

export default config;
