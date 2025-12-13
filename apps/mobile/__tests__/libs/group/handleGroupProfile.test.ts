import { updateGroupImages } from "@/libs/group/handleGroupProfile";
import { api_route } from "@/libs/auth/api";

jest.mock("@/libs/auth/api");

const mockedApi = api_route as jest.Mocked<typeof api_route>;

describe("handleGroupProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("updateGroupImages", () => {
    const groupId = "group-123";

    it("deve atualizar apenas logo quando apenas logoUri é fornecido", async () => {
      const logoUri = "file:///path/to/logo.jpg";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateGroupImages(groupId, logoUri, null, null);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
      expect(mockedApi.patch).toHaveBeenCalledWith(
        `/profile/group/${groupId}/images`,
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

    it("deve atualizar apenas banner quando apenas bannerUri é fornecido", async () => {
      const bannerUri = "file:///path/to/banner.png";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateGroupImages(groupId, null, bannerUri, null);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
      expect(mockedApi.patch).toHaveBeenCalledWith(
        `/profile/group/${groupId}/images`,
        expect.any(Object),
        expect.objectContaining({
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      );
    });

    it("deve atualizar apenas bio quando apenas bio é fornecida", async () => {
      const bio = "Nova descrição do grupo";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateGroupImages(groupId, null, null, bio);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
      expect(mockedApi.patch).toHaveBeenCalledWith(
        `/profile/group/${groupId}/images`,
        expect.any(Object),
        expect.objectContaining({
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      );
    });

    it("deve atualizar logo e banner juntos", async () => {
      const logoUri = "file:///path/to/logo.jpg";
      const bannerUri = "file:///path/to/banner.jpg";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateGroupImages(groupId, logoUri, bannerUri, null);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
      expect(mockedApi.patch).toHaveBeenCalledWith(
        `/profile/group/${groupId}/images`,
        expect.any(Object),
        expect.objectContaining({
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      );
    });

    it("deve atualizar logo, banner e bio juntos", async () => {
      const logoUri = "file:///path/to/logo.jpg";
      const bannerUri = "file:///path/to/banner.jpg";
      const bio = "Nova descrição do grupo";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateGroupImages(groupId, logoUri, bannerUri, bio);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
      expect(mockedApi.patch).toHaveBeenCalledWith(
        `/profile/group/${groupId}/images`,
        expect.any(Object),
        expect.objectContaining({
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      );
    });

    it("deve incluir authToken no header quando fornecido", async () => {
      const logoUri = "file:///path/to/logo.jpg";
      const authToken = "Bearer token123";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateGroupImages(groupId, logoUri, null, null, authToken);

      expect(mockedApi.patch).toHaveBeenCalledWith(
        `/profile/group/${groupId}/images`,
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
      const logoUri = "file:///path/to/logo.jpg";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateGroupImages(groupId, logoUri, null, null);

      expect(mockedApi.patch).toHaveBeenCalledWith(
        `/profile/group/${groupId}/images`,
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

    it("deve tratar extensões de arquivo diferentes para logo", async () => {
      const logoUri = "file:///path/to/logo.png";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateGroupImages(groupId, logoUri, null, null);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
    });

    it("deve tratar extensões de arquivo diferentes para banner", async () => {
      const bannerUri = "file:///path/to/banner.webp";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateGroupImages(groupId, null, bannerUri, null);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
    });

    it("deve usar nome padrão quando filename não pode ser extraído do logo", async () => {
      const logoUri = "file:///invalid";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateGroupImages(groupId, logoUri, null, null);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
    });

    it("deve usar nome padrão quando filename não pode ser extraído do banner", async () => {
      const bannerUri = "file:///invalid";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateGroupImages(groupId, null, bannerUri, null);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
    });

    it("deve lançar erro quando a API retorna erro", async () => {
      const logoUri = "file:///path/to/logo.jpg";
      const errorMessage = "Erro ao atualizar imagens";
      mockedApi.patch.mockRejectedValue({
        response: {
          data: {
            message: errorMessage,
          },
        },
      });

      await expect(
        updateGroupImages(groupId, logoUri, null, null)
      ).rejects.toThrow(errorMessage);

      expect(console.error).toHaveBeenCalled();
    });

    it("deve lançar erro genérico quando a API retorna erro sem mensagem", async () => {
      const logoUri = "file:///path/to/logo.jpg";
      mockedApi.patch.mockRejectedValue(new Error("Network error"));

      await expect(
        updateGroupImages(groupId, logoUri, null, null)
      ).rejects.toThrow("Erro ao atualizar imagens do grupo");

      expect(console.error).toHaveBeenCalled();
    });

    it("deve chamar API mesmo quando todos os parâmetros são null", async () => {
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateGroupImages(groupId, null, null, null);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
      expect(mockedApi.patch).toHaveBeenCalledWith(
        `/profile/group/${groupId}/images`,
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

      await updateGroupImages(groupId, null, null, bio);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
    });

    it("deve processar logoUri com caminho complexo", async () => {
      const logoUri = "file:///storage/emulated/0/Android/data/com.app/files/Pictures/logo.jpeg";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateGroupImages(groupId, logoUri, null, null);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
    });

    it("deve processar bannerUri com caminho complexo", async () => {
      const bannerUri = "content://media/external/images/media/12345";
      mockedApi.patch.mockResolvedValue({ data: {} });

      await updateGroupImages(groupId, null, bannerUri, null);

      expect(mockedApi.patch).toHaveBeenCalledTimes(1);
    });
  });
});

