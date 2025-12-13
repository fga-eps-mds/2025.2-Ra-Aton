// libs/user/handleUserProfile.ts
import { api_route } from "@/libs/auth/api";

/**
 * Atualiza imagens do usuário (foto de perfil e banner) e bio
 */
export async function updateUserImages(
  userId: string,
  profilePictureUri: string | null,
  bannerImageUri: string | null,
  bio: string | null,
  authToken?: string
): Promise<void> {
  try {
    const formData = new FormData();

    // Adicionar foto de perfil se foi selecionada
    if (profilePictureUri) {
      const profileFilename = profilePictureUri.split("/").pop() || "profile.jpg";
      const profileMatch = /\.(\w+)$/.exec(profileFilename);
      const profileType = profileMatch ? `image/${profileMatch[1]}` : "image/jpeg";

      formData.append("profileImage", {
        uri: profilePictureUri,
        name: profileFilename,
        type: profileType,
      } as any);
    }

    // Adicionar banner se foi selecionado
    if (bannerImageUri) {
      const bannerFilename = bannerImageUri.split("/").pop() || "banner.jpg";
      const bannerMatch = /\.(\w+)$/.exec(bannerFilename);
      const bannerType = bannerMatch ? `image/${bannerMatch[1]}` : "image/jpeg";

      formData.append("bannerImage", {
        uri: bannerImageUri,
        name: bannerFilename,
        type: bannerType,
      } as any);
    }

    // Adicionar bio se foi fornecida
    if (bio !== null) {
      formData.append("bio", bio);
    }

    await api_route.patch(`/profile/user/${userId}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });
  } catch (error: any) {
    console.error("Erro ao atualizar imagens do usuário:", error);
    throw new Error(
      error.response?.data?.message || "Erro ao atualizar imagens do usuário"
    );
  }
}
