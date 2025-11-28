import { AxiosError } from "axios";
import { api_route } from "@/libs/auth/api";

export async function requestJoinGroup(userId: string, token: string, groupId: string){

  console.log(`Requesting to join group ${groupId} by user ${userId}`)
  try {
    const res = await api_route.post(`/invite`,
      {
        userId,
        groupId,
        madeBy: "USER",
        message: "Quero participar do grupo.",
      },
        { headers: { Authorization: `Bearer ${token}`} }
    );
    return res.data;
    } catch (error) {
        const e = error as AxiosError;
        console.log("Error requesting join group:", e);
        if(e.response?.status === 409){
          console.log("Sua solicitação já está em análise.");
          return {
            ok: false,
            message: "Sua solicitação já está em análise.",
          };
        }
        // Respostas esperadas do backend (ex: já solicitou, grupo não existe)
        if (e.response?.status === 400 || e.response?.status === 404) {
          return {
            ok: false,
            message: e.response.data || "Request failed",
          };
        }

        // Qualquer outra coisa deixa subir
        throw error;
      }
}
