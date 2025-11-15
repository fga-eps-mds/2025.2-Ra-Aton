import { AxiosError } from "axios";
import { api_route } from "@/libs/auth/api";

type Meta = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

type FeedResponse<T> = { data: T[]; meta: Meta };

type GetFeedArgs = {
  page: number;
  limit: number;
  signal?: AbortSignal;
};

function logAxiosError(prefix: string, e: any) {
  const err = e as AxiosError;
  const status = err?.response?.status;
  const data = err?.response?.data;
  const url = (err as any)?.config?.baseURL + (err as any)?.config?.url;
  const params = (err as any)?.config?.params;
  console.log(`${prefix} status:`, status);
  console.log(`${prefix} data:`, data);
  console.log(`${prefix} url:`, url, "params:", params);
}

export async function getFeed<T = any>({
  page,
  limit,
  signal,
}: GetFeedArgs): Promise<FeedResponse<T>> {
  const qp = { page: String(page), limit: String(limit) };

  try {
    const res = await api_route.get("/posts", { params: qp, signal });
    return res.data;
  } catch (e) {
    // logAxiosError("[GET /posts/", e);
    const status = (e as AxiosError)?.response?.status;
    if (status !== 400) throw e;
  }
}
