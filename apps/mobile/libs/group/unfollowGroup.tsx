import { AxiosError } from "axios";
import { api_route } from "@/libs/auth/api";

export async function unfollowGroup(token: string, groupName: string){

  try {
    const res = await api_route.delete(`follow/groups/${groupName}/follow`,
        { headers: { Authorization: `Bearer ${token}`} }
    );
    console.log("Você deixou de seguir o grupo");
    return res.data;
    } catch (error) {
        const e = error as AxiosError;
        console.log("Erro ao deixar de seguir grupo:", e);
        if(e.response?.status === 409){
          console.log("Voce não segue o grupo.");
          return {
            ok: false,
            message: "Voce não segue o grupo.",
          };
        }
        if (e.response?.status === 400 || e.response?.status === 404) {
          return {
            ok: false,
            message: e.response.data || "Request failed",
          };
        }

        throw error;
      }
}
