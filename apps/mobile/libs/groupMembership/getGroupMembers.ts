import { api_route } from "@/libs/auth/api";
import { IGroupMember } from "@/libs/interfaces/IMember";

export async function getGroupMembers(groupId: string): Promise<IGroupMember[]> {
  try {
    const response = await api_route.get<IGroupMember[]>(`/member/group/${groupId}`);
    return response.data; 
  } catch (error) {
    console.error("Erro ao buscar membros:", error);
    throw new Error("Não foi possível carregar os membros.");
  }
}