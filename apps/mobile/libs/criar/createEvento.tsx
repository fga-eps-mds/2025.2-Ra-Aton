import axios from "axios";
import { api_route } from "../auth/api";

function convertToBackendDate(dateStr: string): string {
  if (!dateStr || !dateStr.includes(" ")) {
    throw new Error("Formato de data inválido: DD/MM/AAAA HH:MM.");
  }

  const [datePart, timePart] = dateStr.split(" ");
  const [day, month, year] = datePart.split("/");

  const date = new Date(`${year}-${month}-${day}T${timePart}:00`);

  if (isNaN(date.getTime())) {
    throw new Error("Data fornecida é inválida.");
  }
  console.log("Data convertida para backend:", date.toISOString());
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
  let eventDateFormatted = "";
  let eventFinishDateFormatted = "";

  try {
    eventDateFormatted = convertToBackendDate(eventDate);
    if (eventFinishDate) {
      eventFinishDateFormatted = convertToBackendDate(eventFinishDate);
    }
  } catch (error: any) {
    return { error: error.message };
  }

  console.log(
    `Title ==> ${title}\nDescricao ==> ${content}\nTipo ==> ${type}\nData ==>${eventDate} até ${eventFinishDate}\nLocalização ==> ${location}`,
  );
  try {
    const response = await api_route.post(
      "/posts",
      {
        title,
        type,
        content,
        eventDate: eventDateFormatted,
        eventFinishDate: eventFinishDateFormatted || undefined,
        location,
        group: "f9769e23-d7dc-4e61-8fb8-4b8547d16b32",
        groupId: "f9769e23-d7dc-4e61-8fb8-4b8547d16b32",
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
      console.error("Erro ao criar evento:", error.message);
      throw new Error("Erro inesperado ao criar [evento].");
    }
  }
}
