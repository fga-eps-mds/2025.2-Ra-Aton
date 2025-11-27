// ARQUIVO: apps/mobile/libs/api/api.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { config, logConfig } from "@/libs/config/env";

// Loga as configurações ao inicializar
if (__DEV__) {
  logConfig();
}

const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("@token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Log de erros de conexão
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Timeout: API não respondeu em 10s');
    } else if (error.message === 'Network Error') {
      console.error('❌ Erro de rede: Verifique se a API está rodando');
      console.error('   URL configurada:', config.apiUrl);
      if (config.apiUrl.includes('localhost')) {
        console.error('   💡 Dica: Use o IP da máquina no .env.local para testar no celular');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
