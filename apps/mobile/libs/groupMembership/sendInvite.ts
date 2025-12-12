import { api_route } from "@/libs/auth/api";
import { IInvitePayload } from "@/libs/interfaces/IMember";

export async function sendInvite(payload: IInvitePayload): Promise<void> {
  try {
    let targetUserId = payload.targetUserId;

    // Se veio um e-mail, precisamos descobrir o ID do usuário primeiro
    if (payload.targetEmail && !targetUserId) {
      try {
        // Tenta buscar usuário pelo e-mail
        // Ajuste a rota de busca conforme seu backend (ex: /users/find-by-email ou query param)
        // Vou assumir uma busca genérica que já temos
        const { data: users } = await api_route.get("/users", {
          params: { search: payload.targetEmail, limit: 1 },
        });

        if (users && users.length > 0) {
          targetUserId = users[0].id;
        } else {
          throw new Error("Usuário não encontrado com este e-mail.");
        }
      } catch (err) {
        throw new Error("Não foi possível localizar o usuário pelo e-mail.");
      }
    }

    if (!targetUserId) {
      throw new Error("ID do usuário alvo é obrigatório.");
    }

    // Payload estritamente conforme a documentação
    const body = {
      userId: targetUserId,
      groupId: payload.groupId,
      madeBy: "GROUP", // Estamos no contexto de um grupo convidando alguém
      message: payload.message || "Você foi convidado para o grupo!",
    };

    console.log("Enviando convite:", body);

    await api_route.post("/invite", body);
  } catch (error: any) {
    console.error("Erro no sendInvite:", error.response?.data || error.message);
    const backendMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Erro ao enviar convite.";
    if (backendMsg) {
      throw new Error(backendMsg);
    }

    throw new Error("Erro ao enviar convite. Verifique sua conexão.");
  }
}
