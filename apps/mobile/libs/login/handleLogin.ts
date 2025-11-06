import axios from "axios";
import { api_route } from "../auth/api";

interface LoginParams {
  email: string;
  password: string;
}

export async function handleLogin(email: string, password: string) {
  try {
    const response = await api_route.post<LoginParams>("/login", { email, password });

    const data = response.data ?? {};
    console.log("Login efetuado com sucesso");
    return data;
  } catch (err: any) {
    if (err.response) {
      let rawData = err.response.data;
      let data: any = {};

      if (typeof rawData === "string") {
        try {
          data = JSON.parse(rawData);
        } catch {
          data = { message: rawData };
        }
      } else {
        data = rawData || {};
      }

      const serverMessage =
        data?.message || data?.error || "Erro ao realizar login";

      console.log("Mensagem de erro do servidor:", serverMessage);
      throw new Error(serverMessage);
    }

    throw new Error("Não foi possível conectar ao servidor");
  }
}
