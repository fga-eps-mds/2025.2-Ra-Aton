// ARQUIVO: apps/mobile/libs/user/searchUsers.ts
import { api_route } from "@/libs/auth/api";

export interface IUserPreview {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}

export async function searchUsers(query: string): Promise<IUserPreview[]> {
  try {
    // Ajuste a rota conforme seu backend. 
    // Exemplo: GET /users?search=joao ou GET /follow/friends?q=joao
    // Estou assumindo uma rota genérica de busca de usuários para convite
    const response = await api_route.get<IUserPreview[]>(`/users`, {
      params: { search: query, limit: 10 }
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return []; 
  }
}