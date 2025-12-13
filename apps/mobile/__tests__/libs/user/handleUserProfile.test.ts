import { updateUserImages } from "@/libs/user/handleUserProfile";
import { api_route } from "@/libs/auth/api";

jest.mock("@/libs/auth/api");

const mockedApi = api_route as jest.Mocked<typeof api_route>;

describe("handleUserProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("updateUserImages", () => {
    const userId = "user-123";

    it("deve atualizar apenas foto de perfil quando apenas profilePictureUri é fornecido", async () => {
      const profilePictureUri = "file:///path/to/profile.jpg";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateUserImages(userId, profilePictureUri, null, null);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
      expect(mockedApi.patch).toHaveBeenCalledWith(
        `/profile/user/${userId}/images`,
        expect.any(Object),
        expect.objectContaining({
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      );

      const formData = mockedApi.patch.mock.calls[0][1] as FormData;
      expect(formData).toBeDefined();
    });

    it("deve atualizar apenas banner quando apenas bannerImageUri é fornecido", async () => {
      const bannerImageUri = "file:///path/to/banner.png";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateUserImages(userId, null, bannerImageUri, null);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
      expect(mockedApi.patch).toHaveBeenCalledWith(
        `/profile/user/${userId}/images`,
        expect.any(Object),
        expect.objectContaining({
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      );
    });

    it("deve atualizar apenas bio quando apenas bio é fornecida", async () => {
      const bio = "Nova descrição do perfil";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateUserImages(userId, null, null, bio);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
      expect(mockedApi.patch).toHaveBeenCalledWith(
        `/profile/user/${userId}/images`,
        expect.any(Object),
        expect.objectContaining({
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      );
    });

    it("deve atualizar foto de perfil e banner juntos", async () => {
      const profilePictureUri = "file:///path/to/profile.jpg";
      const bannerImageUri = "file:///path/to/banner.jpg";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateUserImages(userId, profilePictureUri, bannerImageUri, null);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
      expect(mockedApi.patch).toHaveBeenCalledWith(
        `/profile/user/${userId}/images`,
        expect.any(Object),
        expect.objectContaining({
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      );
    });

    it("deve atualizar foto de perfil, banner e bio juntos", async () => {
      const profilePictureUri = "file:///path/to/profile.jpg";
      const bannerImageUri = "file:///path/to/banner.jpg";
      const bio = "Nova descrição do perfil";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateUserImages(userId, profilePictureUri, bannerImageUri, bio);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
      expect(mockedApi.patch).toHaveBeenCalledWith(
        `/profile/user/${userId}/images`,
        expect.any(Object),
        expect.objectContaining({
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      );
    });

    it("deve incluir authToken no header quando fornecido", async () => {
      const profilePictureUri = "file:///path/to/profile.jpg";
      const authToken = "Bearer token123";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateUserImages(userId, profilePictureUri, null, null, authToken);

      expect(mockedApi.patch).toHaveBeenCalledWith(
        `/profile/user/${userId}/images`,
        expect.any(Object),
        expect.objectContaining({
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authToken}`,
          },
        })
      );
    });

    it("não deve incluir authToken no header quando não fornecido", async () => {
      const profilePictureUri = "file:///path/to/profile.jpg";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateUserImages(userId, profilePictureUri, null, null);

      expect(mockedApi.patch).toHaveBeenCalledWith(
        `/profile/user/${userId}/images`,
        expect.any(Object),
        expect.objectContaining({
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      );

      const headers = mockedApi.patch.mock.calls[0][2]?.headers as any;
      expect(headers.Authorization).toBeUndefined();
    });

    it("deve tratar extensões de arquivo diferentes para foto de perfil", async () => {
      const profilePictureUri = "file:///path/to/profile.png";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateUserImages(userId, profilePictureUri, null, null);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
    });

    it("deve tratar extensões de arquivo diferentes para banner", async () => {
      const bannerImageUri = "file:///path/to/banner.webp";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateUserImages(userId, null, bannerImageUri, null);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
    });

    it("deve usar nome padrão quando filename não pode ser extraído da foto de perfil", async () => {
      const profilePictureUri = "file:///invalid";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateUserImages(userId, profilePictureUri, null, null);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
    });

    it("deve usar nome padrão quando filename não pode ser extraído do banner", async () => {
      const bannerImageUri = "file:///invalid";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateUserImages(userId, null, bannerImageUri, null);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
    });

    it("deve lançar erro quando a API retorna erro", async () => {
      const profilePictureUri = "file:///path/to/profile.jpg";
      const errorMessage = "Erro ao atualizar imagens";
      mockedApi.patch.mockRejectedValue({
        response: {
          data: {
            message: errorMessage,
          },
        },
      });

      await expect(
        updateUserImages(userId, profilePictureUri, null, null)
      ).rejects.toThrow(errorMessage);

      expect(console.error).toHaveBeenCalled();
    });

    it("deve lançar erro genérico quando a API retorna erro sem mensagem", async () => {
      const profilePictureUri = "file:///path/to/profile.jpg";
      mockedApi.patch.mockRejectedValue(new Error("Network error"));

      await expect(
        updateUserImages(userId, profilePictureUri, null, null)
      ).rejects.toThrow("Erro ao atualizar imagens do usuário");

      expect(console.error).toHaveBeenCalled();
    });

    it("deve chamar API mesmo quando todos os parâmetros são null", async () => {
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateUserImages(userId, null, null, null);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
      expect(mockedApi.patch).toHaveBeenCalledWith(
        `/profile/user/${userId}/images`,
        expect.any(Object),
        expect.objectContaining({
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      );
    });

    it("deve processar bio com string vazia", async () => {
      const bio = "";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateUserImages(userId, null, null, bio);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
    });

    it("deve processar profilePictureUri com caminho complexo", async () => {
      const profilePictureUri = "file:///storage/emulated/0/Android/data/com.app/files/Pictures/profile.jpeg";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateUserImages(userId, profilePictureUri, null, null);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
    });

    it("deve processar bannerImageUri com caminho complexo", async () => {
      const bannerImageUri = "content://media/external/images/media/12345";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateUserImages(userId, null, bannerImageUri, null);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
    });

    it("deve funcionar com diferentes IDs de usuário", async () => {
      const userIds = ["user-1", "user-2", "user-3"];
      const profilePictureUri = "file:///path/to/profile.jpg";
      mockedApi.patch.mockResolvedValue({ data: {} });

      for (const id of userIds) {
        await updateUserImages(id, profilePictureUri, null, null);
        expect(mockedApi.patch).toHaveBeenCalledWith(
          `/profile/user/${id}/images`,
          expect.any(Object),
          expect.any(Object)
        );
      }

      expect(mockedApi.patch).toHaveBeenCalledTimes(3);
    });

    it("deve processar erro 403 (sem permissão)", async () => {
      const profilePictureUri = "file:///path/to/profile.jpg";
      mockedApi.patch.mockRejectedValue({
        response: {
          status: 403,
          data: {
            message: "Você não tem permissão para atualizar este perfil",
          },
        },
      });

      await expect(
        updateUserImages(userId, profilePictureUri, null, null)
      ).rejects.toThrow("Você não tem permissão para atualizar este perfil");
    });

    it("deve processar erro 404 (usuário não encontrado)", async () => {
      const profilePictureUri = "file:///path/to/profile.jpg";
      mockedApi.patch.mockRejectedValue({
        response: {
          status: 404,
          data: {
            message: "Usuário não encontrado",
          },
        },
      });

      await expect(
        updateUserImages(userId, profilePictureUri, null, null)
      ).rejects.toThrow("Usuário não encontrado");
    });

    it("deve processar bio com caracteres especiais", async () => {
      const bio = "Olá! 👋 Desenvolvedor 💻\nApaixonado por tecnologia 🚀";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateUserImages(userId, null, null, bio);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
    });
  });
});
