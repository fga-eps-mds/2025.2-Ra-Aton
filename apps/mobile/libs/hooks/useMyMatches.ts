import { useState, useRef, useCallback, useEffect } from "react";
import { Imatches } from "@/libs/interfaces/Imatches";
import { getAllMatchesByUserId } from "@/libs/auth/handleMyMatches";
import { useUser } from "@/libs/storage/UserContext";

export const useMyMatches = () => {
  const { user } = useUser();

  const [matches, setMatches] = useState<Imatches[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const abortRequestWeb = useRef<AbortController | null>(null);
  const isLoadingRef = useRef(false);

  const setLoading = (value: boolean) => {
    isLoadingRef.current = value;
    setIsLoading(value);
  };

  const loadMatches = useCallback(async () => {
    if (isLoadingRef.current) return;

    abortRequestWeb.current?.abort();
    abortRequestWeb.current = new AbortController();
    setLoading(true);

    try {
      const data = await getAllMatchesByUserId(
        abortRequestWeb.current?.signal,
      );

      const matchesArray: Imatches[] = Array.isArray(data) ? data : [];
      console.log("loadMatches - matchesArray:", matchesArray);
      setMatches(matchesArray);
    } catch (err: any) {
      const isCanceled =
        err?.name === "CanceledError" ||
        err?.code === "ERR_CANCELED" ||
        err?.message === "canceled";

      if (isCanceled) return;

      console.error("Erro ao carregar minhas partidas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
    return () => abortRequestWeb.current?.abort();
  }, [loadMatches]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadMatches();
    setIsRefreshing(false);
  }, [loadMatches]);

  const reloadFeed = useCallback(async () => {
    await loadMatches();
  }, [loadMatches]);

  return {
    matches,
    setMatches,
    isLoading,
    isRefreshing,
    onRefresh,
    reloadFeed,
  };
};
