import { AxiosError } from "axios";
import { api_route } from "@/libs/auth/api";

export async function followGroup(token: string, groupName: string){

  try {
    const res = await api_route.post(`follow/groups/${groupName}/follow`,
      {
        groupName,
      },
        { headers: { Authorization: `Bearer ${token}`} }
    );
    console.log("Você está seguindo o grupo");
    return res.data;
    } catch (error) {
        const e = error as AxiosError;
        console.log("Erro ao seguir grupo:", e);
        if(e.response?.status === 409){
          console.log("Voce ja segue o grupo.");
          return {
            ok: false,
            message: "Voce ja segue o grupo.",
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
