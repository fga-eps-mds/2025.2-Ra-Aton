// ARQUIVO: apps/mobile/libs/hooks/useToggleAttendance.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api_route } from "../auth/api";

const toggleAttendance = async (postId: string) => {
  return api_route.post(`/posts/${postId}/attendance`);
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
