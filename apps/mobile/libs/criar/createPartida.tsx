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


interface createPartidaParams {
  author: any;
  userId: string;
  title: string;
  description: string;
  sport: string;
  maxPlayers: number;
  teamNameA: string;
  teamNameB: string;
  MatchDate: string;
  location: string;
  token: string;
}

interface CreatePartidaResponse {
  id?: string;
  title?: string;
  error?: string;
}

export async function createPartida({
  author,
  userId,
  title,
  description,
  sport,
  maxPlayers,
  teamNameA,
  teamNameB,
  MatchDate,
  location,
  token,
}: createPartidaParams): Promise<CreatePartidaResponse> {
  let MatchDateFormatted = "";
  let partidaFinishDateFormatted = "";

  try {
    MatchDateFormatted = convertToBackendDate(MatchDate);
  } catch (error: any) {
    return { error: error.message };
  }

  console.log(`Title ==> ${title}\nDescricao ==> ${description}\nData ==>${MatchDate}\nLocalização ==> ${location}\nUser:`, author);
  try {
    const response = await api_route.post(
      "/match/",
      {
        author,
        userId,
        title,
        description,
        sport,
        maxPlayers,
        teamNameA,
        teamNameB,
        MatchDate: MatchDateFormatted,
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
      const data = error.response.data;
      const message =
        data?.issues?.[0]?.message || data?.error || "Erro ao criar partida.";
      return { error: message };
    } else if (error.request) {
      console.error("Sem resposta do servidor:", error.request);
      throw new Error("Não foi possível conectar ao servidor.");
    } else {
      console.error("Erro ao criar partida:", error.message);
      throw new Error("Erro inesperado ao criar [partida].");
    }
  }
}
