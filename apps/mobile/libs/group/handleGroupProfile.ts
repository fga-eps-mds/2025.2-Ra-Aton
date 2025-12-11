// libs/group/handleGroupProfile.ts
import { api_route } from "@/libs/auth/api";

/**
 * Atualiza imagens do grupo (logo e banner)
 */
export async function updateGroupImages(
  groupId: string,
  logoUri: string | null,
  bannerUri: string | null
): Promise<void> {
  try {
    const formData = new FormData();

    // Adicionar logo se foi selecionado
    if (logoUri) {
      const logoFilename = logoUri.split("/").pop() || "logo.jpg";
      const logoMatch = /\.(\w+)$/.exec(logoFilename);
      const logoType = logoMatch ? `image/${logoMatch[1]}` : "image/jpeg";

      formData.append("logoImage", {
        uri: logoUri,
        name: logoFilename,
        type: logoType,
      } as any);
    }

    // Adicionar banner se foi selecionado
    if (bannerUri) {
      const bannerFilename = bannerUri.split("/").pop() || "banner.jpg";
      const bannerMatch = /\.(\w+)$/.exec(bannerFilename);
      const bannerType = bannerMatch ? `image/${bannerMatch[1]}` : "image/jpeg";

      formData.append("bannerImage", {
        uri: bannerUri,
        name: bannerFilename,
        type: bannerType,
      } as any);
    }

    await api_route.patch(`/profile/group/${groupId}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error: any) {
    console.error("Erro ao atualizar imagens do grupo:", error);
    throw new Error(
      error.response?.data?.message || "Erro ao atualizar imagens do grupo"
    );
  }
}
