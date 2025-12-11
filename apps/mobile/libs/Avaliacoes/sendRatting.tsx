import { api_route } from "../auth/api";

interface sendRattingParams {
    rating: number;
    message?: string;
    token: string;
}

export async function sendRatting({
    rating,
    message = "",
    token,
}: sendRattingParams) {

  try {
    const payload = {
        rating,
        message,
    };
    console.log('[sendRatting] Payload sendo enviado:', JSON.stringify(payload, null, 2));
    
    const response = await api_route.post(
      "/avaliation",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const data = error.response.data;
      const message =
        data?.issues?.[0]?.message || data?.error || "Erro ao enviar avaliação.";
      return { error: message };
    } else if (error.request) {
      console.error("Sem resposta do servidor:", error.request);
      throw new Error("Não foi possível conectar ao servidor.");
    } else {
      console.error("Erro ao enviar avaliação:", error.message);
      throw new Error("Erro inesperado ao enviar avaliação.");
    }
  }
}
