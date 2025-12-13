// libs/interfaces/Iprofile.ts
import { IPost } from "./Ipost";
import { Imatches } from "./Imatches";
import { IGroup } from "./Igroup";

export type ProfileType = "user" | "group";

// Interface base para informações de usuário
export interface IUserProfile {
  id: string;
  userName: string;
  name: string;
  email?: string;
  bio?: string;
  profilePicture?: string;
  bannerImage?: string;
  createdAt: string;
  updatedAt: string;
  
  // Estatísticas
  followersCount?: number;
  followingCount?: number;
  groupsCount?: number;
  matchesCount?: number;
  
  // Relação com o usuário atual
  isFollowing?: boolean;
  isOwner?: boolean;
}

// Interface base para informações de grupo
export interface IGroupProfile {
  id: string;
  name: string;
  description: string;
  type: "ATHLETIC" | "AMATEUR";
  sport?: string;
  leaderId: string;
  bio?: string;
  logoUrl?: string;
  bannerUrl?: string;
  createdAt: string;
  updatedAt: string;
  
  // Estatísticas
  membersCount?: number;
  postsCount?: number;
  followersCount?: number;
  
  // Relação com o usuário atual
  isFollowing?: boolean;
  isMember?: boolean;
  isLeader?: boolean;
}

// Dados das abas do perfil de usuário
export interface IUserProfileTabs {
  matches: Imatches[];
  followedGroups: IGroup[];
  memberGroups: IGroup[];
}

// Dados das abas do perfil de grupo
export interface IGroupProfileTabs {
  members: IUserProfile[];
  posts: IPost[];
}

// Response completo do perfil de usuário
export interface IUserProfileResponse {
  profile: IUserProfile;
  tabs: IUserProfileTabs;
}

// Response completo do perfil de grupo
export interface IGroupProfileResponse {
  profile: IGroupProfile;
  tabs: IGroupProfileTabs;

  
}
