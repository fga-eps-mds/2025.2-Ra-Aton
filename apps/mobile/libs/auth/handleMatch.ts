// libs/auth/handleMatches.ts (por exemplo)
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

export async function getMatchesFeed({
  page,
  limit,
  signal,
}: GetMatchesParams): Promise<MatchFeedResponse> {
  const res = await api_route.get<MatchFeedResponse>("/match", {
    params: { page, limit },
    signal,
  });

  return res.data;
}

export async function subscribeToMatch(matchId:string): Promise<void> {
  await api_route.post(`/match/${matchId}/subscribe`);
}

export async function unsubscribeFromMatch(matchId: string): Promise<void> {
  await api_route.delete(`/match/${matchId}/unsubscribe`);
}

export async function getMatchById(matchId: string): Promise <Imatches> {
  const res = await api_route.get<Imatches>(`/match/${matchId}`);
  return res.data;
}

export async function switchTeam(matchId: string): Promise<void> {
  await api_route.post(`/match/${matchId}/switch`);
}