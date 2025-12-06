import { AxiosError } from "axios";
import { api_route } from "@/libs/auth/api";

export async function loadSolicitacoes(userId: string) {
  try {
    const res = await api_route.get(`/invite/all/user/${userId}`);
    return res.data;
  } catch (e) {
    console.log("Error loading solicitacoes:", e);

    const status = (e as AxiosError)?.response?.status;

    if (status === 400 || status === 404) {
      return [];
    }

    throw e;
  }
}
