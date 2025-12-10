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
  groupId: string;
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
  groupId,
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

  console.log('[createEvent] Parâmetros recebidos:');
  console.log('  - title:', title);
  console.log('  - type:', type);
  console.log('  - content:', content);
  console.log('  - eventDate:', eventDate);
  console.log('  - eventFinishDate:', eventFinishDate);
  console.log('  - location:', location);
  console.log('  - groupId:', groupId);
  console.log('  - groupId type:', typeof groupId);
  console.log('  - groupId is null?', groupId === null);
  console.log('  - groupId is undefined?', groupId === undefined);
  try {
    const payload = {
      title,
      type,
      content,
      eventDate: eventDateFormatted,
      eventFinishDate: eventFinishDateFormatted || undefined,
      location,
      groupId,
    };
    console.log('[createEvent] Payload sendo enviado:', JSON.stringify(payload, null, 2));
    
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
      console.error("Erro ao criar evento:", error.message);
      throw new Error("Erro inesperado ao criar [evento].");
    }
  }
}
