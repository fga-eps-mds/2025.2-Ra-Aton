import { api_route } from "@/libs/auth/api";
import { Imatches } from "@/libs/interfaces/Imatches";

type MatchMeta = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type MatchFeedResponse = {
  data: Imatches[];
  meta: MatchMeta;
};

type GetMatchesParams = {
  page: number;
  limit: number;
  signal?: AbortSignal;
};

export async function getAllMatchesByUserId(
  signal?: AbortSignal,
): Promise<Imatches[]> {
  const res = await api_route.get<MatchFeedResponse>("/match/author", {
    params: { page: 1, limit: 100 },
    signal,
  });
  
  const dataArray = Array.isArray(res.data) ? res.data : res.data.data;
  console.log("getAllMatchesByUserId data array:", dataArray);
  
  return dataArray;
}


export async function updateMatch(
  id: string,
  data: {
    title?: string;
    description?: string;
    sport?: string;
    maxPlayers?: number;
    teamNameA?: string;
    teamNameB?: string;
    location?: string;
    MatchDate?: string;
    teamAScore?: number;
    teamBScore?: number;
  },
): Promise<Imatches> {
  const res = await api_route.patch<Imatches>(`/match/${id}`, data);
  return res.data;
}

