import multer from "multer";
import { Request } from "express";
import { ApiError } from "../utils/ApiError";
import httpStatus from "http-status";

// Configurar armazenamento em memória (Cloudinary receberá o buffer)
const storage = multer.memoryStorage();

// Filtro de tipo de arquivo
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  // Aceitar apenas imagens
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        httpStatus.BAD_REQUEST,
        "Apenas arquivos de imagem são permitidos!",
      ),
    );
  }
};

// Configuração do Multer
export const upload: multer.Multer = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
});

// Middleware específico para upload de perfil (aceita profileImage e bannerImage)
export const uploadUserImages = upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "bannerImage", maxCount: 1 },
]);

// Middleware para upload apenas de imagem de perfil
export const uploadProfileImage = upload.single("profileImage");

// Middleware para upload apenas de banner
export const uploadBannerImage = upload.single("bannerImage");
