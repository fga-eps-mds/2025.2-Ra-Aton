import { AxiosError } from "axios";
import { api_route } from "@/libs/auth/api";

export async function cancelarSolicitacao(inviteId: string) {
  console.log(`tentando deletar a solicitação ${inviteId}`)
  try {
    const res = await api_route.delete(`/invite/${inviteId}`);
    return res.data;
  } catch (e) {
    console.log("Error deletando solicitação:", e);

    const status = (e as AxiosError)?.response?.status;

    if (status === 400 || status === 404) {
      return [];
    }

    throw e;
  }
}
