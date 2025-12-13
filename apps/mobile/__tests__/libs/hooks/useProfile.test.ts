import { renderHook, waitFor } from "@testing-library/react-native";
import { useProfile } from "@/libs/hooks/useProfile";
import {
  getUserProfile,
  getGroupProfile,
  followGroup,
  unfollowGroup,
} from "@/libs/auth/handleProfile";

jest.mock("@/libs/auth/handleProfile");

const mockedGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>;
const mockedGetGroupProfile = getGroupProfile as jest.MockedFunction<typeof getGroupProfile>;
const mockedFollowGroup = followGroup as jest.MockedFunction<typeof followGroup>;
const mockedUnfollowGroup = unfollowGroup as jest.MockedFunction<typeof unfollowGroup>;

describe("useProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("User Profile", () => {
    const mockUserProfileData = {
      profile: {
        id: "user-1",
        name: "João Silva",
        userName: "joao",
        email: "joao@example.com",
        profilePicture: null,
        bio: "Desenvolvedor",
        followersCount: 10,
        isFollowing: false,
      },
      tabs: {
        matches: [],
        followedGroups: [],
        memberGroups: [],
      },
    };

    it("deve carregar perfil de usuário com sucesso", async () => {
      mockedGetUserProfile.mockResolvedValue(mockUserProfileData);

      const { result } = renderHook(() => useProfile("joao", "user"));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.profile).toEqual(mockUserProfileData.profile);
      expect(result.current.tabs).toEqual(mockUserProfileData.tabs);
      expect(result.current.error).toBeNull();
      expect(result.current.isFollowing).toBe(false);
      expect(mockedGetUserProfile).toHaveBeenCalledWith("joao");
    });

    it("deve definir isFollowing como true quando usuário está seguindo", async () => {
      const followingData = {
        ...mockUserProfileData,
        profile: { ...mockUserProfileData.profile, isFollowing: true },
      };
      mockedGetUserProfile.mockResolvedValue(followingData);

      const { result } = renderHook(() => useProfile("joao", "user"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isFollowing).toBe(true);
    });

    it("deve tratar erro ao carregar perfil de usuário", async () => {
      const errorMessage = "Usuário não encontrado";
      mockedGetUserProfile.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      const { result } = renderHook(() => useProfile("invalid", "user"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.profile).toBeNull();
      expect(result.current.error).toBe(errorMessage);
      expect(console.error).toHaveBeenCalled();
    });

    it("deve usar mensagem de erro genérica quando API não retorna mensagem", async () => {
      mockedGetUserProfile.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useProfile("joao", "user"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe("Erro ao carregar perfil");
    });

    it("não deve carregar perfil quando identifier está vazio", async () => {
      const { result } = renderHook(() => useProfile("", "user"));

      // Aguarda um pouco para garantir que nada foi chamado
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockedGetUserProfile).not.toHaveBeenCalled();
      // isLoading permanece true porque loadProfile retorna early
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("Group Profile", () => {
    const mockGroupProfileData = {
      profile: {
        id: "group-1",
        name: "Grupo Teste",
        description: "Descrição do grupo",
        profilePicture: null,
        followersCount: 20,
        isFollowing: false,
      },
      tabs: {
        posts: [],
        members: [],
      },
    };

    it("deve carregar perfil de grupo com sucesso", async () => {
      mockedGetGroupProfile.mockResolvedValue(mockGroupProfileData);

      const { result } = renderHook(() => useProfile("Grupo Teste", "group"));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.profile).toEqual(mockGroupProfileData.profile);
      expect(result.current.tabs).toEqual(mockGroupProfileData.tabs);
      expect(result.current.error).toBeNull();
      expect(result.current.isFollowing).toBe(false);
      expect(mockedGetGroupProfile).toHaveBeenCalledWith("Grupo Teste");
    });

    it("deve definir isFollowing como true quando usuário está seguindo o grupo", async () => {
      const followingData = {
        ...mockGroupProfileData,
        profile: { ...mockGroupProfileData.profile, isFollowing: true },
      };
      mockedGetGroupProfile.mockResolvedValue(followingData);

      const { result } = renderHook(() => useProfile("Grupo Teste", "group"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isFollowing).toBe(true);
    });

    it("deve tratar erro ao carregar perfil de grupo", async () => {
      const errorMessage = "Grupo não encontrado";
      mockedGetGroupProfile.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      const { result } = renderHook(() => useProfile("invalid", "group"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.profile).toBeNull();
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe("toggleFollow", () => {
    it("deve seguir grupo quando não está seguindo", async () => {
      const mockData = {
        profile: {
          id: "group-1",
          name: "Grupo Teste",
          followersCount: 10,
          isFollowing: false,
        },
        tabs: { posts: [], members: [] },
      };
      mockedGetGroupProfile.mockResolvedValue(mockData);
      mockedFollowGroup.mockResolvedValue();

      const { result } = renderHook(() => useProfile("Grupo Teste", "group"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.toggleFollow();

      await waitFor(() => {
        expect(result.current.isFollowing).toBe(true);
      });

      expect(mockedFollowGroup).toHaveBeenCalledWith("Grupo Teste");
      expect(result.current.profile?.followersCount).toBe(11);
    });

    it("deve deixar de seguir grupo quando está seguindo", async () => {
      const mockData = {
        profile: {
          id: "group-1",
          name: "Grupo Teste",
          followersCount: 10,
          isFollowing: true,
        },
        tabs: { posts: [], members: [] },
      };
      mockedGetGroupProfile.mockResolvedValue(mockData);
      mockedUnfollowGroup.mockResolvedValue();

      const { result } = renderHook(() => useProfile("Grupo Teste", "group"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.toggleFollow();

      await waitFor(() => {
        expect(result.current.isFollowing).toBe(false);
      });

      expect(mockedUnfollowGroup).toHaveBeenCalledWith("Grupo Teste");
      expect(result.current.profile?.followersCount).toBe(9);
    });

    it("não deve fazer nada quando profile é null", async () => {
      mockedGetGroupProfile.mockResolvedValue({
        profile: null as any,
        tabs: { posts: [], members: [] },
      });

      const { result } = renderHook(() => useProfile("Grupo Teste", "group"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.toggleFollow();

      expect(mockedFollowGroup).not.toHaveBeenCalled();
      expect(mockedUnfollowGroup).not.toHaveBeenCalled();
    });

    it("deve tratar erro ao seguir grupo", async () => {
      const mockData = {
        profile: {
          id: "group-1",
          name: "Grupo Teste",
          followersCount: 10,
          isFollowing: false,
        },
        tabs: { posts: [], members: [] },
      };
      const errorMessage = "Erro ao seguir grupo";
      mockedGetGroupProfile.mockResolvedValue(mockData);
      mockedFollowGroup.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      const { result } = renderHook(() => useProfile("Grupo Teste", "group"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.toggleFollow();

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });

      expect(console.error).toHaveBeenCalled();
    });

    it("deve usar mensagem de erro genérica quando não há mensagem da API", async () => {
      const mockData = {
        profile: {
          id: "group-1",
          name: "Grupo Teste",
          followersCount: 10,
          isFollowing: false,
        },
        tabs: { posts: [], members: [] },
      };
      mockedGetGroupProfile.mockResolvedValue(mockData);
      mockedFollowGroup.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useProfile("Grupo Teste", "group"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.toggleFollow();

      await waitFor(() => {
        expect(result.current.error).toBe("Erro ao processar ação");
      });
    });

    it("deve tratar followersCount undefined", async () => {
      const mockData = {
        profile: {
          id: "group-1",
          name: "Grupo Teste",
          isFollowing: false,
        },
        tabs: { posts: [], members: [] },
      };
      mockedGetGroupProfile.mockResolvedValue(mockData);
      mockedFollowGroup.mockResolvedValue();

      const { result } = renderHook(() => useProfile("Grupo Teste", "group"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.toggleFollow();

      await waitFor(() => {
        expect(result.current.profile?.followersCount).toBe(1);
      });
    });
  });

  describe("reloadProfile", () => {
    it("deve recarregar perfil quando reloadProfile é chamado", async () => {
      const mockData = {
        profile: {
          id: "user-1",
          name: "João Silva",
          userName: "joao",
          followersCount: 10,
          isFollowing: false,
        },
        tabs: { matches: [], followedGroups: [], memberGroups: [] },
      };
      mockedGetUserProfile.mockResolvedValue(mockData);

      const { result } = renderHook(() => useProfile("joao", "user"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockedGetUserProfile).toHaveBeenCalledTimes(1);

      await result.current.reloadProfile();

      await waitFor(() => {
        expect(mockedGetUserProfile).toHaveBeenCalledTimes(2);
      });
    });

    it("deve limpar erro anterior ao recarregar perfil", async () => {
      mockedGetUserProfile.mockRejectedValueOnce(new Error("Error"));
      
      const mockData = {
        profile: {
          id: "user-1",
          name: "João Silva",
          userName: "joao",
          isFollowing: false,
        },
        tabs: { matches: [], followedGroups: [], memberGroups: [] },
      };

      const { result } = renderHook(() => useProfile("joao", "user"));

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      mockedGetUserProfile.mockResolvedValue(mockData);

      await result.current.reloadProfile();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe("useEffect dependency", () => {
    it("deve recarregar perfil quando identifier muda", async () => {
      const mockData1 = {
        profile: { id: "user-1", name: "User 1", userName: "user1", isFollowing: false },
        tabs: { matches: [], followedGroups: [], memberGroups: [] },
      };
      const mockData2 = {
        profile: { id: "user-2", name: "User 2", userName: "user2", isFollowing: false },
        tabs: { matches: [], followedGroups: [], memberGroups: [] },
      };

      mockedGetUserProfile.mockResolvedValueOnce(mockData1);
      mockedGetUserProfile.mockResolvedValueOnce(mockData2);

      const { result, rerender } = renderHook(
        ({ identifier }) => useProfile(identifier, "user"),
        { initialProps: { identifier: "user1" } }
      );

      await waitFor(() => {
        expect(result.current.profile?.userName).toBe("user1");
      });

      rerender({ identifier: "user2" });

      await waitFor(() => {
        expect(result.current.profile?.userName).toBe("user2");
      });

      expect(mockedGetUserProfile).toHaveBeenCalledTimes(2);
    });
  });
});
