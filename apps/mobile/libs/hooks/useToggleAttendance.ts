// ARQUIVO: apps/mobile/libs/hooks/useToggleAttendance.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api_route } from "../auth/api";

type toggleEuVouArgs = {
  postId: string;
  authorId: string;
};

const toggleAttendance = async ({ postId, authorId }: toggleEuVouArgs) => {
  return api_route.post(`/posts/${postId}/attendance`, { authorId });
};

export function useToggleAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (error) => {
      console.error("Falha ao confirmar presença:", error);
    },
  });
}
