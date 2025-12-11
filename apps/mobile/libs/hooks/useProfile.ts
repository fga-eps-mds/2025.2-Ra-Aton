// libs/hooks/useProfile.ts
import { useState, useEffect, useCallback } from "react";
import {
  getUserProfile,
  getGroupProfile,
  followGroup,
  unfollowGroup,
  followUser,
  unfollowUser,
} from "@/libs/auth/handleProfile";
import {
  IUserProfile,
  IGroupProfile,
  IUserProfileTabs,
  IGroupProfileTabs,
  ProfileType,
} from "@/libs/interfaces/Iprofile";

type ProfileData = IUserProfile | IGroupProfile;
type ProfileTabs = IUserProfileTabs | IGroupProfileTabs;

export function useProfile(identifier: string, type: ProfileType) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [tabs, setTabs] = useState<ProfileTabs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!identifier) return;

    setIsLoading(true);
    setError(null);

    try {
      if (type === "user") {
        const data = await getUserProfile(identifier);
        setProfile(data.profile);
        setTabs(data.tabs);
        setIsFollowing(data.profile.isFollowing ?? false);
      } else {
        const data = await getGroupProfile(identifier);
        setProfile(data.profile);
        setTabs(data.tabs);
        setIsFollowing(data.profile.isFollowing ?? false);
      }
    } catch (err: any) {
      console.error("Erro ao carregar perfil:", err);
      setError(err.response?.data?.message || "Erro ao carregar perfil");
    } finally {
      setIsLoading(false);
    }
  }, [identifier, type]);

  const toggleFollow = async () => {
    if (!profile) return;

    try {
      if (type === "user") {
        if (isFollowing) {
          await unfollowUser(profile.id);
        } else {
          await followUser(profile.id);
        }
      } else {
        if (isFollowing) {
          await unfollowGroup(profile.id);
        } else {
          await followGroup(profile.id);
        }
      }
      setIsFollowing(!isFollowing);
      
      // Atualiza o contador
      if (type === "user") {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                followersCount: (prev.followersCount ?? 0) + (isFollowing ? -1 : 1),
              }
            : prev
        );
      } else {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                followersCount: (prev.followersCount ?? 0) + (isFollowing ? -1 : 1),
              }
            : prev
        );
      }
    } catch (err: any) {
      console.error("Erro ao seguir/desseguir:", err);
      setError(err.response?.data?.message || "Erro ao processar ação");
    }
  };

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    tabs,
    isLoading,
    error,
    isFollowing,
    toggleFollow,
    reloadProfile: loadProfile,
  };
}
