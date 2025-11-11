import axios from "axios";
import { IP } from "@/libs/auth/api";

interface createEventParams {
  title: string;
  type: string;
  content: string;
  eventDate: string;
  eventFinishDate: string;
  location: string;
  userName: string;
  token: string;
  group: string;
}

interface CreateEventResponse {
  id?: string;
  title?: string;
  error?: string;
}

export async function createEvent({
  title,
  type,
  content,
  eventDate,
  eventFinishDate,
  location,
  userName,
  token,
  group,
}: createEventParams): Promise<CreateEventResponse> {
  console.log(`Title ==> ${title}\nDescricao ==> ${content}`);
  try {
    const response = await axios.post(
      `${IP}/post/`,
      {
        title,
        type,
        content,
        eventDate,
        eventFinishDate,
        location,
        userName,
        group,
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
        error: error.response.data.error || "Erro ao criar [evento].",
      };
    } else if (error.request) {
      console.error("Sem resposta do servidor:", error.request);
      throw new Error("Não foi possível conectar ao servidor.");
    } else {
      console.error("Erro ao criar evento:", error.message);
      throw new Error("Erro inesperado ao criar [evento].");
    }
  }
}
