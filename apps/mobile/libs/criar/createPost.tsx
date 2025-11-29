import axios from "axios";
import { api_route } from "../auth/api";

interface createPostParams {
  title: string;
  type: string;
  content: string;
  token: string;
  groupId: string;
}

interface CreatePostResponse {
  id?: string;
  title?: string;
  error?: string;
}

export async function createPost({
  title,
  type,
  content,
  token,
  groupId,
}: createPostParams): Promise<CreatePostResponse> {
  console.log('[createPost] Parâmetros recebidos:');
  console.log('  - title:', title);
  console.log('  - type:', type);
  console.log('  - content:', content);
  console.log('  - groupId:', groupId);
  console.log('  - groupId type:', typeof groupId);
  console.log('  - groupId is null?', groupId === null);
  console.log('  - groupId is undefined?', groupId === undefined);
  try {
    const payload = {
      title,
      type,
      content,
      groupId,
    };
    console.log('[createPost] Payload sendo enviado:', JSON.stringify(payload, null, 2));
    
    const response = await api_route.post(
      "/posts",
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
        data?.issues?.[0]?.message || data?.error || "Erro ao criar evento.";
      return { error: message };
    } else if (error.request) {
      console.error("Sem resposta do servidor:", error.request);
      throw new Error("Não foi possível conectar ao servidor.");
    } else {
      console.error("Erro ao criar post:", error.message);
      throw new Error("Erro inesperado ao criar [post].");
    }
  }
}
