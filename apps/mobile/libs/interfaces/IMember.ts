export type MemberRole = 'ADMIN' | 'MEMBER';

export interface IGroupMember {
  id: string; // ID da relação (membershipId)
  userId: string;
  groupId: string;
  role: MemberRole;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    username?: string; // Útil para busca
  };
  joinedAt: string;
}

export interface IInvitePayload {
  groupId: string;
  targetUserId?: string; // Para convidar amigo da plataforma
  targetEmail?: string;  // Para convidar por e-mail
  message?: string;
}