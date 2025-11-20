import axios from "axios";
import { api_route } from "../auth/api";

interface createPostParams {
  title: string;
  type: string;
  content: string;
  token: string;
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
}: createPostParams): Promise<CreatePostResponse> {
  console.log(
    `Title ==> ${title}\nDescricao ==> ${content}\nTipo ==> ${type}\n`,
  );
  try {
    const response = await api_route.post(
      "/posts",
      {
        title,
        type,
        content,
      },
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
