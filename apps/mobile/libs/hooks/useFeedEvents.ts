import { useState, useRef, useCallback, useEffect } from "react";
import { getFeed } from "@/libs/auth/handleFeed";
import { IPost } from "@/libs/interfaces/Ipost";

export const useFeedEvents = () => {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsloading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const abortRequestWeb = useRef<AbortController | null>(null);
  const throttleRequest = useRef(0);
  const isLoadingRef = useRef(false);

  const LIMIT = 10;

  const setLoading = (value: boolean) => {
    isLoadingRef.current = value;
    setIsloading(value);
  };

  const loadPage = useCallback(async (targetPage: number, append: boolean) => {
    if (isLoadingRef.current) return;

    abortRequestWeb.current?.abort();
    abortRequestWeb.current = new AbortController();
    setLoading(true);

    try {
      const res = await getFeed({
        page: targetPage,
        limit: LIMIT,
        signal: abortRequestWeb.current?.signal,
      });

      const backendHasNext = res?.meta?.hasNextPage;
      let nextHasNextPage =
        typeof backendHasNext === "boolean"
          ? backendHasNext
          : Array.isArray(res?.data) && res.data.length === LIMIT;

      if (Array.isArray(res?.data) && res.data.length === 0 && targetPage > 1) {
        nextHasNextPage = false;
      }

      setHasNextPage(nextHasNextPage);
      setPage(res?.meta?.page ?? targetPage);

      setPosts((prev) => {
        const newData: IPost[] = Array.isArray(res?.data) ? res.data : [];
        if (!append) return newData;

        const map = new Map<string, IPost>();
        [...prev, ...newData].forEach((p) => map.set(String(p.id), p));
        return Array.from(map.values());
      });
    } catch (err: any) {
      const isCanceled =
        err?.name === "CanceledError" ||
        err?.code === "ERR_CANCELED" ||
        err?.message === "canceled";
      if (isCanceled) return;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(1, false);
    return () => abortRequestWeb.current?.abort();
  }, [loadPage]);

  const onRefresh = useCallback(async () => {
    throttleRequest.current = 0;
    setIsRefreshing(true);
    await loadPage(1, false);
    setIsRefreshing(false);
  }, [loadPage]);

  const reloadFeed = useCallback(async () => {
    await loadPage(1, false);
  }, [loadPage]);

  const onEndReached = useCallback(() => {
    if (posts.length === 0) return;
    if (isLoadingRef.current || !hasNextPage) return;

    const now = Date.now();
    if (now - throttleRequest.current < 800) return;
    throttleRequest.current = now;

    loadPage(page + 1, true);
  }, [hasNextPage, posts.length, page, loadPage]);

  return {
    posts,
    setPosts,
    isLoading,
    isRefreshing,
    hasNextPage,
    onRefresh,
    reloadFeed,
    onEndReached,
  };
};