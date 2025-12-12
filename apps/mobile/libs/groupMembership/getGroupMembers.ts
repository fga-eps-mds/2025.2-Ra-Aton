//Buscar a lista de membros.
import { api_route } from "@/libs/auth/api";
import { IGroupMember } from "@/libs/interfaces/IMember";

export async function getGroupMembers(groupId: string): Promise<IGroupMember[]> {
  try {
    // Rota baseada no padrão do seu backend. 
    // Ajuste se necessário para: /groups/${groupId}/members
    const response = await api_route.get<IGroupMember[]>(`/group-membership/group/${groupId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar membros:", error);
    throw new Error("Não foi possível carregar os membros.");
  }
}