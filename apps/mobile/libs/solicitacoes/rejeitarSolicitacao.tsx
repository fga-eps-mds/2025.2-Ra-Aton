import { AxiosError } from "axios";
import { api_route } from "@/libs/auth/api";

export async function rejeitarSolicitacao(inviteId: string) {
  console.log(`tentando [Rejeitar] a solicitação ${inviteId}`)
  try {
    const res = await api_route.patch(`/invite/${inviteId}`,
        { status: "REJECTED" }
    );
    return res.data;
  } catch (e) {
    console.log("Error Rejeitando solicitação:", e);

    const status = (e as AxiosError)?.response?.status;

    if (status === 400 || status === 404) {
      return [];
    }

    throw e;
  }
}
