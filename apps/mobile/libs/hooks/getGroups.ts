// src/hooks/useGroups.ts
import { useEffect, useState } from "react";
import { loadGroups } from "@/libs/group/loadGroups"

type Group = {
  id: string;
  name: string;
  groupType: "AMATEUR" | "ATHLETIC";
};

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [selectedType, setSelectedType] = useState<"AMATEUR" | "ATHLETIC">("AMATEUR");

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

  const filtered = groups.filter(g => g.groupType === selectedType);

  return {
    groups,
    filtered,
    loading,
    error,
    selectedType,
    setSelectedType,
  };
}
