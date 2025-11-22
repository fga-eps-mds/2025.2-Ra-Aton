// ARQUIVO: apps/mobile/libs/group/handleCreateGroup.ts
import { api_route } from "@/libs/auth/api"; // Seu cliente Axios configurado
import { CreateGroupPayload, IGroup } from "@/libs/interfaces/Igroup";

interface CreateGroupResponse {
  message: string;
  group: IGroup;
}

/**
 * Envia os dados para criar um novo grupo.
 * Endpoint esperado: POST /group (Verifique se é singular ou plural no backend)
 */
export async function handleCreateGroup(
  payload: CreateGroupPayload,
): Promise<IGroup> {
  try {
    console.log("Enviando dados do grupo:", payload);

    // Ajuste a URL conforme a rota exata do seu backend ('/group' ou '/groups')
    // Baseado no padrão REST costuma ser '/group' ou '/groups'
    const response = await api_route.post<CreateGroupResponse>(
      "/group",
      payload,
    );

    console.log("Grupo criado com sucesso:", response.data);
    return response.data.group;
  } catch (error: any) {
    // Tratamento de erro padrão
    let errorMessage = "Erro ao criar o grupo.";

    if (error.response) {
      const data = error.response.data;
      // Tenta extrair a mensagem de erro do backend
      if (typeof data === "string") {
        try {
          const parsed = JSON.parse(data);
          errorMessage = parsed.message || parsed.error || errorMessage;
        } catch {
          errorMessage = data;
        }
      } else {
        errorMessage = data.message || data.error || errorMessage;
      }
    } else if (error.request) {
      errorMessage = "Sem resposta do servidor. Verifique sua conexão.";
    }

    console.error("Erro no handleCreateGroup:", errorMessage);
    throw new Error(errorMessage);
  }
}
