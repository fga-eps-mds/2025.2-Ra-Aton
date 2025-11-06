import { api_route } from "./api";

interface RegisterUserParams {
  name: string;
  userName: string;
  email: string;
  password: string;
}

export async function registerUser({ name, userName, email, password }: RegisterUserParams) {
  try {
    const response = await api_route.post("/users", { name, userName, email, password });
    return response.data ?? {};
  } catch (error: any) {
    if (error.response) {
      let raw = error.response.data;
      let data: any = {};

      if (typeof raw === "string") {
        try { data = JSON.parse(raw); } catch { data = { message: raw }; }
      } else {
        data = raw || {};
      }

      const serverMessage = data?.message || data?.error || "Erro ao cadastrar";
      throw new Error(serverMessage);
    }
    throw new Error("Não foi possível conectar ao servidor");
  }
}
