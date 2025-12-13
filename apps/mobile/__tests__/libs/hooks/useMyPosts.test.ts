jest.mock("expo-secure-store", () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn(), deleteItemAsync: jest.fn() }));

// Mock corrigido para evitar loop infinito no useFocusEffect
jest.mock("expo-router", () => {
  const React = require("react");
  return {
    router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
    useFocusEffect: jest.fn((cb) => React.useEffect(cb, [])),
  };
});

jest.mock("react-native/Libraries/Alert/Alert", () => ({ alert: jest.fn() }));

jest.mock("@/libs/auth/api");
jest.mock("@/libs/storage/UserContext");

import { renderHook, act, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useMyPosts } from "@/libs/hooks/useMyPosts";
import { api_route } from "@/libs/auth/api";
import { useUser } from "@/libs/storage/UserContext";

describe("useMyPosts", () => {
  const mockUser = { id: "user1", token: "abc" };

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });
  });

  it("deve carregar posts do usuário e filtrar corretamente", async () => {
    const postsMock = [
      { id: "1", authorId: "user1", content: "Post do user" },
      { id: "2", authorId: "otherUser", content: "Post de outro" },
      { id: "3", authorId: "user1", content: "Outro post do user" }
    ];

    (api_route.get as jest.Mock).mockResolvedValue({
      data: { data: postsMock }
    });

    const { result } = renderHook(() => useMyPosts());

    // Verifica estado inicial de loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(api_route.get).toHaveBeenCalledWith("/posts", {
      params: { limit: 50, page: 1 }
    });

    expect(result.current.myPosts).toHaveLength(2);
    expect(result.current.myPosts).toEqual([
      postsMock[0],
      postsMock[2]
    ]);
  });

  it("não deve buscar posts se o usuário não tiver ID", async () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });
    
    const { result } = renderHook(() => useMyPosts());

    expect(result.current.isLoading).toBe(false);
    expect(api_route.get).not.toHaveBeenCalled();
    expect(result.current.myPosts).toEqual([]);
  });

  it("deve lidar com erro ao carregar posts", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    (api_route.get as jest.Mock).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useMyPosts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(consoleSpy).toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith("Erro", "Não foi possível carregar seus posts.");
    expect(result.current.myPosts).toEqual([]);
    
    consoleSpy.mockRestore();
  });

  it("deve lidar com refresh corretamente", async () => {
    (api_route.get as jest.Mock).mockResolvedValue({
      data: { data: [] }
    });

    const { result } = renderHook(() => useMyPosts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      result.current.onRefresh();
    });

    expect(result.current.isRefreshing).toBe(false); 
    expect(api_route.get).toHaveBeenCalledTimes(2);
  });

  it("deve deletar um post com sucesso e atualizar o estado", async () => {
    const postsMock = [{ id: "1", authorId: "user1" }];
    
    (api_route.get as jest.Mock).mockResolvedValue({
      data: { data: postsMock }
    });
    (api_route.delete as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useMyPosts());

    await waitFor(() => {
      expect(result.current.myPosts).toHaveLength(1);
    });

    await act(async () => {
      await result.current.handleDeletePost("1");
    });

    expect(api_route.delete).toHaveBeenCalledWith("/posts/1");
    expect(result.current.myPosts).toHaveLength(0);
    expect(Alert.alert).toHaveBeenCalledWith("Sucesso", "Post deletado com sucesso.");
  });

  it("deve exibir erro se falhar ao deletar post", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const postsMock = [{ id: "1", authorId: "user1" }];
    
    (api_route.get as jest.Mock).mockResolvedValue({
      data: { data: postsMock }
    });
    (api_route.delete as jest.Mock).mockRejectedValue(new Error("Delete Error"));

    const { result } = renderHook(() => useMyPosts());

    await waitFor(() => {
      expect(result.current.myPosts).toHaveLength(1);
    });

    await act(async () => {
      await result.current.handleDeletePost("1");
    });

    expect(api_route.delete).toHaveBeenCalledWith("/posts/1");
    expect(result.current.myPosts).toHaveLength(1);
    expect(Alert.alert).toHaveBeenCalledWith("Erro", "Não foi possível deletar o post.");
    
    consoleSpy.mockRestore();
  });

  it("deve tratar resposta da API quando data é nula", async () => {
    (api_route.get as jest.Mock).mockResolvedValue({
      data: { data: null }
    });

    const { result } = renderHook(() => useMyPosts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.myPosts).toEqual([]);
  });
});