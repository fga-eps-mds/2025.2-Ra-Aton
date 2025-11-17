// apps/mobile/src/libs/api.ts
import axios, { AxiosError, AxiosRequestHeaders } from "axios";
import { getUserData } from "@/libs/storage/getUserData";

export const api_route = axios.create({
  baseURL: "http://localhost:4000",
  timeout: 5000,  
});


api_route.interceptors.request.use(
  async (config) => {
    try {
      const user = await getUserData(); 
      const token: string | null = user?.token ?? null;

      const headers = { ...(config.headers || {}) } as AxiosRequestHeaders;

      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log("[api_route] attaching token:", token.slice(0, 12) + "...");
      } else {
        console.warn("[api_route] sem token no storage");
      }

      config.headers = headers;
    } catch (e) {
      console.warn("[api_route] falha ao ler token:", e);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// RESPONSE: loga 401 para facilitar diagnóstico
api_route.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const status = err.response?.status;
    if (status === 401) {
      console.warn("[api_route] 401 Unauthorized (token ausente/expirado/inválido)");
    }
    return Promise.reject(err);
  },
);
