// libs/auth/handleProfile.ts
import { api_route } from "@/libs/auth/api";
import {
  IUserProfile,
  IGroupProfile,
  IUserProfileResponse,
  IGroupProfileResponse,
} from "@/libs/interfaces/Iprofile";

/**
 * Busca o perfil de um usuário pelo userName
 */
export async function getUserProfile(userName: string): Promise<IUserProfileResponse> {
  const res = await api_route.get<IUserProfileResponse>(`/profile/user/${userName}`);
  return res.data;
}

/**
 * Busca o perfil de um grupo pelo nome
 */
export async function getGroupProfile(groupName: string): Promise<IGroupProfileResponse> {
  const res = await api_route.get<IGroupProfileResponse>(`/profile/group/${groupName}`);
  return res.data;
}

/**
 * Segue um grupo
 */
export async function followGroup(groupId: string): Promise<void> {
  await api_route.post(`/groups/${groupId}/follow`);
}

/**
 * Deixa de seguir um grupo
 */
export async function unfollowGroup(groupId: string): Promise<void> {
  await api_route.delete(`/groups/${groupId}/unfollow`);
}

/**
 * Segue um usuário
 */
export async function followUser(userId: string): Promise<void> {
  await api_route.post(`/users/${userId}/follow`);
}

/**
 * Deixa de seguir um usuário
 */
export async function unfollowUser(userId: string): Promise<void> {
  await api_route.delete(`/users/${userId}/unfollow`);
}
