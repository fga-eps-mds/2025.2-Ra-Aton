// ARQUIVO: apps/mobile/libs/hooks/useToggleLike.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api_route } from "../auth/api";

type toggleLikeArgs = {
  postId: string;
  authorId: string;
};

export const toggleLike = async ({ postId, authorId }: toggleLikeArgs) => {
  return api_route.post(`/posts/${postId}/like`, { authorId });
};

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (error) => {
      console.error("Falha ao dar like:", error);
    },
  });
}
