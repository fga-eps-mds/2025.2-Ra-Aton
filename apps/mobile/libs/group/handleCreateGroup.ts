// ARQUIVO: apps/mobile/libs/group/handleCreateGroup.ts
import { api_route } from "@/libs/auth/api";
import { IGroup } from "@/libs/interfaces/Igroup";

// Interface baseada na documentação group.md + Necessidades do Frontend
export interface CreateGroupPayload {
  name: string;
  description?: string;
  sports?: string[];
  verificationRequest: boolean;
  acceptingNewMembers?: boolean;
  type?: "ATHLETIC" | "AMATEUR";
}

// O Backend retorna o próprio Grupo, não um objeto com { group: ... }
// Portanto, não precisamos mais da interface CreateGroupResponse antiga.

export async function handleCreateGroup(
  payload: CreateGroupPayload,
): Promise<IGroup> {
  try {
    // 1. Separa o 'type' do resto dos dados
    const { type, ...payloadToSend } = payload;

    console.log(
      "Enviando dados do grupo para /group (sem type):",
      payloadToSend,
    );

    // 2. Envia apenas os dados que o backend aceita
    // A resposta da API é do tipo IGroup diretamente
    const response = await api_route.post<IGroup>("/group", payloadToSend);

    console.log("Resposta da API:", response.data);

    // CORREÇÃO CRÍTICA: Retornar response.data diretamente
    return response.data;
  } catch (error: any) {
    let errorMessage = "Erro ao criar o grupo.";

    if (error.response) {
      const data = error.response.data;
      console.error("Erro detalhado do Backend:", data);

      if (typeof data === "string") {
        try {
          const parsed = JSON.parse(data);
          errorMessage = parsed.message || parsed.error || errorMessage;
        } catch {
          errorMessage = data;
        }
      } else {
        if (data.issues && Array.isArray(data.issues)) {
          errorMessage = data.issues.map((i: any) => i.message).join(" / ");
        } else {
          errorMessage = data.message || data.error || errorMessage;
        }
      }
    } else if (error.request) {
      errorMessage = "Sem resposta do servidor. Verifique sua conexão.";
    }

    console.error("Erro no handleCreateGroup:", errorMessage);
    throw new Error(errorMessage);
  }
}
