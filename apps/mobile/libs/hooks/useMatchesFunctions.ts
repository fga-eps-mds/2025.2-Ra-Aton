// libs/hooks/useMatchesFunctions.ts
import { useState, useRef, useCallback, useEffect } from "react";
import { Alert, Platform } from "react-native";
import axios from "axios";
import { Imatches } from "@/libs/interfaces/Imatches";
import {
  getMatchesFeed,
  subscribeToMatch,
  getMatchById,
  switchTeam as switchTeamRequest,
  unsubscribeFromMatch,
} from "../auth/handleMatch";
import { useUser } from "../storage/UserContext";

export const useFeedMatches = () => {
  const { user } = useUser();

  const [matches, setMatches] = useState<Imatches[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [subscribedMatchIds, setSubscribedMatchIds] = useState<string[]>([]);

  const abortRequestWeb = useRef<AbortController | null>(null);
  const throttleRequest = useRef(0);
  const isLoadingRef = useRef(false);

  const LIMIT = 10;

  const setLoading = (value: boolean) => {
    isLoadingRef.current = value;
    setIsLoading(value);
  };

  const markAsSubscribed = useCallback((matchId: string) => {
    setSubscribedMatchIds((prev) =>
      prev.includes(matchId) ? prev : [...prev, matchId],
    );
  }, []);

  const syncSubscribedFromBackend = useCallback(
    async (matchesToCheck: Imatches[]) => {
      const userId = user?.id;
      if (!userId) return;

      try {
        const detailed = await Promise.all(
          matchesToCheck.map((m) => getMatchById(m.id).catch(() => null)),
        );

        const subscribedIds: string[] = [];

        detailed.forEach((dm) => {
          if (!dm) return;
          const teamAPlayers = dm.teamA?.players ?? [];
          const teamBPlayers = dm.teamB?.players ?? [];

          const isSubscribed =
            teamAPlayers.some((p) => p.id === userId) ||
            teamBPlayers.some((p) => p.id === userId);

          if (isSubscribed) subscribedIds.push(dm.id);
        });

        setSubscribedMatchIds((prev) => {
          const set = new Set(prev);
          subscribedIds.forEach((id) => set.add(id));
          return Array.from(set);
        });
      } catch (e) {
        console.error("Erro ao sincronizar inscrições:", e);
      }
    },
    [user?.id],
  );

  const isUserSubscriped = useCallback(
    (match: Imatches): boolean => {
      const userId = user?.id;
      if (!userId) return false;

      if (subscribedMatchIds.includes(match.id)) return true;

      const teamAPlayers = match.teamA?.players ?? [];
      const teamBPlayers = match.teamB?.players ?? [];

      return (
        teamAPlayers.some((p) => p.id === userId) ||
        teamBPlayers.some((p) => p.id === userId)
      );
    },
    [user?.id, subscribedMatchIds],
  );

  const loadPage = useCallback(
    async (targetPage: number, append: boolean) => {
      if (isLoadingRef.current) return;

      abortRequestWeb.current?.abort();
      abortRequestWeb.current = new AbortController();
      setLoading(true);

      try {
        const res = await getMatchesFeed({
          page: targetPage,
          limit: LIMIT,
          signal: abortRequestWeb.current?.signal,
        });

        const backendHasNext = res?.meta?.hasNextPage;
        let nextHasNextPage =
          typeof backendHasNext === "boolean"
            ? backendHasNext
            : Array.isArray(res?.data) && res.data.length === LIMIT;

        if (
          Array.isArray(res?.data) &&
          res.data.length === 0 &&
          targetPage > 1
        ) {
          nextHasNextPage = false;
        }

        setHasNextPage(nextHasNextPage);
        setPage(res?.meta?.page ?? targetPage);

        const newData: Imatches[] = Array.isArray(res?.data) ? res.data : [];

        setMatches((prev) => {
          if (!append) return newData;

          const map = new Map<string, Imatches>();
          [...prev, ...newData].forEach((m) => map.set(String(m.id), m));
          return Array.from(map.values());
        });

        if (newData.length > 0) {
          syncSubscribedFromBackend(newData);
        }
      } catch (err: any) {
        const isCanceled =
          err?.name === "CanceledError" ||
          err?.code === "ERR_CANCELED" ||
          err?.message === "canceled";

        if (isCanceled) return;

        console.error("Erro ao carregar partidas:", err);
      } finally {
        setLoading(false);
      }
    },
    [syncSubscribedFromBackend],
  );

  const joinMatch = useCallback(
    (match: Imatches, openModalConfirmCard: (match: Imatches) => void) => {
      if (isUserSubscriped(match)) {
        markAsSubscribed(match.id);

        (async () => {
          try {
            const updated = await getMatchById(match.id);
            openModalConfirmCard(updated);
          } catch (err) {
            console.error("Erro ao buscar detalhes da partida:", err);
            Alert.alert("Erro", "Não foi possível abrir a partida.");
          }
        })();
        return;
      }

      const subscribeAndOpen = async () => {
        try {
          await subscribeToMatch(match.id);
          markAsSubscribed(match.id);
        } catch (err: any) {
          if (axios.isAxiosError(err)) {
            const status = err.response?.status;
            const message =
              (err.response?.data as any)?.message ??
              "Não foi possível entrar na partida.";

            if (status === 409) {
              markAsSubscribed(match.id);
              Alert.alert(
                "Aviso",
                message || "Você já está inscrito nesta partida.",
              );
              return;
            }

            if (status === 403) {
              Alert.alert("Partida cheia", message);
              return;
            }

            console.error("Erro ao entrar na partida:", err);
            Alert.alert("Erro", message);
            return;
          }

          console.error("Erro ao entrar na partida:", err);
          Alert.alert(
            "Erro",
            "Não foi possível entrar na partida. Tente novamente.",
          );
        }

        try {
          const updatedMatch = await getMatchById(match.id);
          openModalConfirmCard(updatedMatch);
          await loadPage(1, false);
        } catch (e) {
          console.error("Erro ao buscar detalhes da partida:", e);
          Alert.alert("Erro", "Não foi possível carregar os dados da partida.");
        }
      };

      if (Platform.OS === "web") {
        subscribeAndOpen();
        return;
      }

      Alert.alert(
        "Participar da partida",
        "Você realmente deseja entrar nesta partida?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Confirmar",
            style: "default",
            onPress: subscribeAndOpen,
          },
        ],
      );
    },
    [isUserSubscriped, markAsSubscribed, loadPage],
  );

  const leaveMatch = useCallback(
    (match: Imatches, onAfterLeave?: () => void) => {
      const doUnsubscribe = async () => {
        try {
          await unsubscribeFromMatch(match.id);
          setSubscribedMatchIds((prev) => prev.filter((id) => id !== match.id));

          await loadPage(1, false);

          if (onAfterLeave) {
            onAfterLeave();
          }
        } catch (err: any) {
          if (axios.isAxiosError(err)) {
            const message =
              (err.response?.data as any)?.message ??
              "Não foi possível sair da partida.";
            console.error("Erro ao sair da partida:", err);
            Alert.alert("Erro", message);
            return;
          }

          console.error("Erro ao sair da partida:", err);
          Alert.alert(
            "Erro",
            "Não foi possível sair da partida. Tente novamente.",
          );
        }
      };

      if (Platform.OS === "web") {
        doUnsubscribe();
        return;
      }

      Alert.alert(
        "Sair da partida",
        "Tem certeza que deseja sair desta partida?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Confirmar", onPress: doUnsubscribe },
        ],
      );
    },
    [loadPage],
  );

  const switchTeam = useCallback(
    (match: Imatches, updateMatchInModal: (match: Imatches) => void) => {
      const doSwitch = async () => {
        try {
          await switchTeamRequest(match.id);

          const updatedMatch = await getMatchById(match.id);

          updateMatchInModal(updatedMatch);

          await loadPage(1, false);
        } catch (err: any) {
          if (axios.isAxiosError(err)) {
            const status = err.response?.status;
            const message =
              (err.response?.data as any)?.message ??
              "Não foi possível trocar de time.";

            if (status === 403) {
              Alert.alert("Aviso", message);
              return;
            }

            Alert.alert("Erro", message);
            return;
          }

          console.error("Erro ao trocar de time:", err);
          Alert.alert(
            "Erro",
            "Não foi possível trocar de time. Tente novamente.",
          );
        }
      };

      if (Platform.OS === "web") {
        doSwitch();
        return;
      }

      Alert.alert(
        "Trocar de time",
        "Você deseja trocar de time nesta partida?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Confirmar", onPress: doSwitch },
        ],
      );
    },
    [loadPage],
  );

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
    if (matches.length === 0) return;
    if (isLoadingRef.current || !hasNextPage) return;

    const now = Date.now();
    if (now - throttleRequest.current < 800) return;
    throttleRequest.current = now;

    loadPage(page + 1, true);
  }, [hasNextPage, matches.length, page, loadPage]);

  return {
    matches,
    setMatches,
    isLoading,
    isRefreshing,
    hasNextPage,
    onRefresh,
    reloadFeed,
    onEndReached,
    joinMatch,
    isUserSubscriped,
    switchTeam,
    leaveMatch,
  };
};
