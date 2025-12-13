import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useToggleLike } from "@/libs/hooks/useToggleLike";
import { api_route } from "@/libs/auth/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

jest.mock("@/libs/auth/api", () => ({
  api_route: {
    post: jest.fn(),
  },
}));

describe("useToggleLike", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("deve chamar api_route.post com os parametros corretos e invalidar queries no sucesso", async () => {
    (api_route.post as jest.Mock).mockResolvedValue({ data: "success" });
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useToggleLike(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ postId: "post-123", authorId: "user-456" });
    });

    expect(api_route.post).toHaveBeenCalledWith("/posts/post-123/like", {
      authorId: "user-456",
    });

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["feed"] });
    });
  });

  it("deve logar erro no console quando a api falhar", async () => {
    const error = new Error("Falha na requisição");
    (api_route.post as jest.Mock).mockRejectedValue(error);
    const consoleSpy = jest.spyOn(console, "error");

    const { result } = renderHook(() => useToggleLike(), { wrapper });

    await act(async () => {
      try {
        await result.current.mutateAsync({ postId: "post-123", authorId: "user-456" });
      } catch (e) {
      }
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Falha ao dar like:", error);
    });
  });
});