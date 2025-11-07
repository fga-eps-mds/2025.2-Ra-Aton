// apps/mobile/src/interfaces/IPost.ts
export interface IPost {
  id: string;
  userId: string;
  userProfileImageUrl: string;
  userName: string;
  postText: string;
  postDate: string; // Ou Date, dependendo do que você usa
  likes: number;
  comments: number;
  isLiked: boolean;
  isGoing: boolean;
  // NOVO: URL da imagem, opcional
  imageUrl?: string;
  type: "post";
  event;
}
