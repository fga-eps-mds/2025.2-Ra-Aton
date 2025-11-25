// src/hooks/useGroups.ts
import { useEffect, useState } from "react";
import { loadGroups } from "@/libs/group/loadGroups"

type Group = {
  id: string;
  name: string;
  groupType: "AMATEUR" | "ATHLETIC";
  acceptingNewMembers: boolean;
  description: string;
};

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedType, setSelectedType] = useState<"AMATEUR" | "ATHLETIC">("AMATEUR");
  const [acceptingOnly, setAcceptingOnly] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await loadGroups();
        setGroups(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredByType  = groups.filter(g => g.groupType === selectedType);
  const filteredFinal = acceptingOnly ? filteredByType.filter((g) => g.acceptingNewMembers) : filteredByType;

  return {
    groups,
    filtered: filteredFinal,
    loading,
    error,
    selectedType,
    setSelectedType,
    acceptingOnly,
    setAcceptingOnly,
  };
}
