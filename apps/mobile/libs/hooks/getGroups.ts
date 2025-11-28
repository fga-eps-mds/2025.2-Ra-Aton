import { useCallback, useState } from "react";
import { loadGroups } from "@/libs/group/loadGroups";
import { useUser } from "@/libs/storage/UserContext";
import { useFocusEffect } from "@react-navigation/native";

export type Group = {
  id: string;
  name: string;
  groupType: "AMATEUR" | "ATHLETIC";
  acceptingNewMembers: boolean;
  description: string;
  isMember: boolean;
  isFollowing: boolean;
};

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedType, setSelectedType] = useState<"AMATEUR" | "ATHLETIC">("AMATEUR");
  const [acceptingOnly, setAcceptingOnly] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { user } = useUser();

  const reload = useCallback(async () => {
    if (!user?.token || !user?.id) return;

    try {
      setLoading(true);
      const data = await loadGroups(user.token, user.id);
      // console.log("DATA:", JSON.stringify(data, null, 2));
      setGroups(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user?.token, user?.id]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const updateGroup = (updatedGroup: Group) => {
    setGroups(prev =>
      prev.map(g => g.id === updatedGroup.id ? { ...g, ...updatedGroup } : g)
    );
  };

  const myGroups = groups.filter(g => g.isMember);
  const otherGroups = groups.filter(g => !g.isMember);

  const filteredByType = otherGroups.filter(g => g.groupType === selectedType);
  const filteredFinal = acceptingOnly
    ? filteredByType.filter(g => g.acceptingNewMembers)
    : filteredByType;

  return {
    groups,
    myGroups,
    otherGroups,
    filtered: filteredFinal,
    reload,
    loading,
    updateGroup,
    error,
    selectedType,
    setSelectedType,
    acceptingOnly,
    setAcceptingOnly,
  };
}
