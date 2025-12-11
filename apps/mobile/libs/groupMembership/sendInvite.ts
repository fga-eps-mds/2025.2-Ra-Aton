import { api_route } from "@/libs/auth/api";
import { IInvitePayload } from "@/libs/interfaces/IMember";

export async function sendInvite(payload: IInvitePayload): Promise<void> {
  try {
    // Rota de criação de convite (GroupJoinRequest)
    await api_route.post("/invite", payload);
  } catch (error: any) {
    const msg = error.response?.data?.message || "Erro ao enviar convite.";
    throw new Error(msg);
  }
}
