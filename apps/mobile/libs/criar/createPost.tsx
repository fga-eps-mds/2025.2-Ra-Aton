import axios from "axios";
import { IP } from "@/libs/auth/api";

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

  console.log(`Title ==> ${title}\nDescricao ==> ${content}\nTipo ==> ${type}\n`);
  try {
    const response = await axios.post(
      `${IP}/posts/`,
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
      // O servidor respondeu com um status != 2__
      return {
        error: error.response.data.error || "Erro ao criar [post].",
      };
    } else if (error.request) {
      console.error("Sem resposta do servidor:", error.request);
      throw new Error("Não foi possível conectar ao servidor.");
    } else {
      console.error("Erro ao criar post:", error.message);
      throw new Error("Erro inesperado ao criar [post].");
    }
  }
}
