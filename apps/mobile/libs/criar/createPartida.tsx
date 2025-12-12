import axios from "axios";
import { api_route } from "../auth/api";

function validarData(dateStr: string): string | null {
const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  console.log("data testada = ",dateStr);
  if (!regex.test(dateStr)) {
    return "Formato da data inválido";
  }

  const [datePart] = dateStr.split("T");
  const [year, month, day] = datePart.split("-").map(Number);

  if (day < 1 || day > 31) return "Data impossível.";
  if (month < 1 || month > 12) return "Data impossível.";
  if (year < 1900) return "Data impossível.";

  return null;
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

  const validationError = validarData(MatchDate);
  if (validationError) {
    return { error: validationError };
  }

  try {
    MatchDateFormatted = MatchDate;
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
