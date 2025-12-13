import { api_route } from "@/libs/auth/api";

export interface IUserPreview {
  id: string;
  name: string;
  userName: string;
  profilePicture?: string;
  
  email?: string; // Adicionado para permitir busca por email também
}

export async function searchUsers(query: string): Promise<IUserPreview[]> {
  try {
    // 1. Busca TODOS os usuários (já que o backend não filtra)
    // O parâmetro 'search' é enviado, mas ignorado pelo backend atual.
    const response = await api_route.get<IUserPreview[]>('/users');
    const allUsers = response.data;

    // 2. Filtragem LOCAL no frontend (Case-insensitive)
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) return [];

    const filteredUsers = allUsers.filter(user => {
      const nameMatch = user.name.toLowerCase().includes(normalizedQuery);
      const usernameMatch = user.userName.toLowerCase().includes(normalizedQuery);
      const emailMatch = user.email ? user.email.toLowerCase().includes(normalizedQuery) : false;
      
      return nameMatch || usernameMatch || emailMatch;
    });

    // Opcional: Limitar a 10 resultados para não travar a lista
    return filteredUsers.slice(0, 10);

  } catch (error) {
    console.error("Erro na busca local de usuários:", error);
    return [];
  }
}