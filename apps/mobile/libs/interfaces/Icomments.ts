export interface Icomment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    userName: string;
  };
}
