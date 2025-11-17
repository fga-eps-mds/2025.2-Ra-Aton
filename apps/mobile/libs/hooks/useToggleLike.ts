// ARQUIVO: apps/mobile/libs/hooks/useToggleLike.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api_route } from "../auth/api";
const toggleLike = async (postId: string) => {
  return api_route.post(`/posts/${postId}/like`);
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
