// ARQUIVO: apps/mobile/libs/group/handleCreateGroup.ts

// 1. MUDANÇA CRÍTICA: Importar do caminho CORRETO (src/libs/api)
import { api_route } from "../../../mobile/libs/auth/api";
import { IGroup } from "@/libs/interfaces/Igroup";

// Interface baseada na documentação group.md + Necessidades do Frontend
export interface CreateGroupPayload {
  name: string;
  description?: string;
  sports?: string[];
  verificationRequest: boolean;
  acceptingNewMembers?: boolean;
  // Mantemos o type para o frontend, removemos antes de enviar
  type?: "ATHLETIC" | "AMATEUR";
}

interface CreateGroupResponse {
  message: string;
  group: IGroup;
}

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
    const response = await api_route.post<CreateGroupResponse>(
      "/group", // Rota no singular
      payloadToSend,
    );

    console.log("Resposta da API:", response.data);
    return response.data.group;
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
