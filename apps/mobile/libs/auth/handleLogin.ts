import axios from "axios";
import { api_route } from "./api";

interface LoginParams {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    userName: string;
    email: string;
    profileType: string | null;
  };
}

export async function handleLogin(
  email: string,
  password: string,
): Promise<LoginResponse> {
  try {
    const response = await api_route.post<LoginResponse>("/login", {
      email,
      password,
    });

    const data = response.data;
    console.log("Login efetuado com sucesso");
    return data;
  } catch (err: any) {
    if (err.response) {
      const type_message = err.response.data;
      let data: any = {};

      if (typeof type_message === "string") {
        try {
          data = JSON.parse(type_message);
        } catch {
          data = { message: type_message };
        }
      } else {
        data = type_message || {};
      }

      const serverMessage =
        data?.message || data?.error || "Erro ao realizar login";

      console.log("Mensagem de erro do servidor:", serverMessage);
      throw new Error(serverMessage);
    }

    throw new Error("Não foi possível conectar ao servidor");
  }
}
