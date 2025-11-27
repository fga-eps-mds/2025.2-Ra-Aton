import { useCallback, useEffect, useState } from "react";
import { loadSolicitacoes } from "@/libs/solicitacoes/loadSolicitacoes"
import { useUser } from "@/libs/storage/UserContext";
import { useFocusEffect } from "@react-navigation/native";
type group = {
    name: string;
    id: string;
}
type user = {
    userName: string;
    id: string;
}
type solicitacoes = {
    id: string;
    user: user;
    group: group;
    status: string;
    madeBy: string;
};

export function useSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<solicitacoes[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useUser();

useFocusEffect(
  useCallback(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      try {
        const data = await loadSolicitacoes(user.id);
        setSolicitacoes(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id])
);


  return {
    solicitacoes,
    loading,
    error,
  };
}
