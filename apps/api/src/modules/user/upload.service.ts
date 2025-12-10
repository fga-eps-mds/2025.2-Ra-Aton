import cloudinary from "../../config/cloudinary";
import { config } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

export interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadService = {
  /**
   * Faz upload de uma imagem para o Cloudinary
   * @param fileBuffer - Buffer do arquivo
   * @param folder - Subpasta no Cloudinary
   * @param publicId - ID público opcional (para sobrescrever)
   * @returns URL e publicId da imagem
   */
  uploadImage: async (
    fileBuffer: Buffer,
    folder: string,
    publicId?: string,
  ): Promise<UploadResult> => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `${config.CLOUDINARY_FOLDER}/${folder}`,
          public_id: publicId,
          overwrite: publicId ? true : false,
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) {
            reject(
              new ApiError(
                httpStatus.INTERNAL_SERVER_ERROR,
                "Erro ao fazer upload da imagem",
              ),
            );
          }
          if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        },
      );

      uploadStream.end(fileBuffer);
    });
  },

  /**
   * Deleta uma imagem do Cloudinary
   * @param publicId - ID público da imagem
   */
  deleteImage: async (publicId: string): Promise<void> => {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Erro ao deletar imagem do Cloudinary:", error);
      // Não lançar erro para não quebrar o fluxo se a imagem já foi deletada
    }
  },

  /**
   * Upload de imagem de perfil
   */
  uploadProfileImage: async (
    fileBuffer: Buffer,
    userId: string,
    oldPublicId?: string,
  ): Promise<UploadResult> => {
    // Deletar imagem antiga se existir
    if (oldPublicId) {
      await uploadService.deleteImage(oldPublicId);
    }

    return uploadService.uploadImage(
      fileBuffer,
      "profiles",
      `profile_${userId}`,
    );
  },

  /**
   * Upload de banner
   */
  uploadBannerImage: async (
    fileBuffer: Buffer,
    userId: string,
    oldPublicId?: string,
  ): Promise<UploadResult> => {
    // Deletar banner antigo se existir
    if (oldPublicId) {
      await uploadService.deleteImage(oldPublicId);
    }

    return uploadService.uploadImage(fileBuffer, "banners", `banner_${userId}`);
  },
};
