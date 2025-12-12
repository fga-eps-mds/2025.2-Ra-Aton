// libs/interfaces/Ipost.ts
export interface IPost {
  id: string;
  title: string | null;
  content: string | null;
  type: "GENERAL" | "EVENT" | string;

  author: {
    userName: string;
    id: string;
    profileImageUrl?: string | null;
  };
  authorId: string | null;

  group: {
    name: string;
    id: string;
    logoUrl?: string | null;
  };
  groupId?: string | null;

  createdAt?: string;
  updatedAt?: string;

  eventDate?: string | null;
  eventFinishDate?: string | null;
  location?: string | null;

  likesCount?: number;
  commentsCount?: number;
  attendancesCount?: number;

  // campos locais/derivados
  userLiked?: boolean;
  userGoing?: boolean;
}
