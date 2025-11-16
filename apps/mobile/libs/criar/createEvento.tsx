import axios from "axios";
import { IP } from "@/libs/auth/api";

function convertToBackendDate(dateStr: string): string {
  // recebe: "dd/mm/yyyy hh:mm"
  const [datePart, timePart] = dateStr.split(" ");
  const [day, month, year] = datePart.split("/");

  // formatação do backend
  const date = new Date(`${year}-${month}-${day}T${timePart}:00Z`);

  return date.toISOString(); 
}


interface createEventParams {
  title: string;
  type: string;
  content: string;
  eventDate: string;
  eventFinishDate: string;
  location: string;
  token: string;
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
  token,
}: createEventParams): Promise<CreateEventResponse> {
  const eventDateFormatted = convertToBackendDate(eventDate);
  const eventFinishDateFormatted = convertToBackendDate(eventFinishDate);

  console.log(`Title ==> ${title}\nDescricao ==> ${content}\nTipo ==> ${type}\nData ==>${eventDate} até ${eventFinishDate}\nLocalização ==> ${location}`);
  try {
    const response = await axios.post(
      `${IP}/posts/`,
      {
        title,
        type,
        content,
        eventDate: eventDateFormatted,
        eventFinishDate: eventFinishDateFormatted,
        location,
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
