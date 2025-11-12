import { api_route } from "@/libs/auth/api";
import { IPost } from "@/libs/interfaces/Ipost";

export type FeedMeta = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type FeedResponse = {
  data: IPost[];
  meta: FeedMeta;
};

export async function getFeed(params: {
  page: number;
  limit?: number;
  signal?: AbortSignal;
}): Promise<FeedResponse> {
  const { page, limit = 10, signal } = params;

  const res = await api_route.get<FeedResponse>("/posts", {
    params: { page, limit },    
    signal,
  });

  return res.data;
}
