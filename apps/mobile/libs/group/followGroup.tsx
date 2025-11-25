import { AxiosError } from "axios";
import { api_route } from "@/libs/auth/api";

export async function followGroup(token: string, groupId: string){

  try {
    const res = await api_route.post(`follow/groups/${groupId}/follow`,
      {
        groupId,
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
