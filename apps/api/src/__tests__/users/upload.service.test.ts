// MOCK DO AMBIENTE
jest.mock("../../config/env", () => ({
  config: {
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    NODE_ENV: "test",
    JWT_SECRET: "test-secret",
    JWT_EXPIRES_IN: "1h",
    EXPO_ACCESS_TOKEN: "test-token",
    CLOUDINARY_FOLDER: "test-folder",
  },
}));

// MOCK DO CLOUDINARY
const mockUploadStream = jest.fn();
const mockDestroy = jest.fn();

jest.mock("../../config/cloudinary", () => ({
  __esModule: true,
  default: {
    uploader: {
      upload_stream: jest.fn(),
      destroy: mockDestroy,
    },
  },
}));

import cloudinary from "../../config/cloudinary";
import { uploadService } from "../../modules/user/upload.service";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

describe("UploadService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("uploadImage", () => {
    it("Deve fazer upload de imagem com sucesso", async () => {
      const mockBuffer = Buffer.from("fake-image-data");
      const mockResult = {
        secure_url: "https://cloudinary.com/image.jpg",
        public_id: "test-folder/profiles/test-id",
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, mockResult);
          return {
            end: jest.fn(),
          };
        }
      );

      const result = await uploadService.uploadImage(
        mockBuffer,
        "profiles",
        "test-id"
      );

      expect(result).toEqual({
        url: mockResult.secure_url,
        publicId: mockResult.public_id,
      });
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        {
          folder: "test-folder/profiles",
          public_id: "test-id",
          overwrite: true,
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        expect.any(Function)
      );
    });

    it("Deve fazer upload sem publicId (overwrite false)", async () => {
      const mockBuffer = Buffer.from("fake-image-data");
      const mockResult = {
        secure_url: "https://cloudinary.com/image.jpg",
        public_id: "test-folder/profiles/generated-id",
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, mockResult);
          return {
            end: jest.fn(),
          };
        }
      );

      const result = await uploadService.uploadImage(mockBuffer, "profiles");

      expect(result).toEqual({
        url: mockResult.secure_url,
        publicId: mockResult.public_id,
      });
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({
          public_id: undefined,
          overwrite: false,
        }),
        expect.any(Function)
      );
    });

    it("Deve lançar ApiError quando upload falha", async () => {
      const mockBuffer = Buffer.from("fake-image-data");
      const mockError = new Error("Upload failed");

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(mockError, null);
          return {
            end: jest.fn(),
          };
        }
      );

      await expect(
        uploadService.uploadImage(mockBuffer, "profiles", "test-id")
      ).rejects.toThrow(ApiError);

      await expect(
        uploadService.uploadImage(mockBuffer, "profiles", "test-id")
      ).rejects.toMatchObject({
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Erro ao fazer upload da imagem",
      });
    });

    it("Deve chamar uploadStream.end com o buffer", async () => {
      const mockBuffer = Buffer.from("fake-image-data");
      const mockEnd = jest.fn();
      const mockResult = {
        secure_url: "https://cloudinary.com/image.jpg",
        public_id: "test-id",
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, mockResult);
          return {
            end: mockEnd,
          };
        }
      );

      await uploadService.uploadImage(mockBuffer, "profiles");

      expect(mockEnd).toHaveBeenCalledWith(mockBuffer);
    });
  });

  describe("deleteImage", () => {
    it("Deve deletar imagem com sucesso", async () => {
      mockDestroy.mockResolvedValue({ result: "ok" });

      await uploadService.deleteImage("test-public-id");

      expect(mockDestroy).toHaveBeenCalledWith("test-public-id");
    });

    it("Deve capturar erro e logar sem lançar exceção", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockDestroy.mockRejectedValue(new Error("Delete failed"));

      await expect(
        uploadService.deleteImage("test-public-id")
      ).resolves.not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Erro ao deletar imagem do Cloudinary:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it("Deve continuar mesmo se a imagem não existir", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockDestroy.mockRejectedValue(new Error("Resource not found"));

      await uploadService.deleteImage("non-existent-id");

      expect(mockDestroy).toHaveBeenCalledWith("non-existent-id");
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("uploadProfileImage", () => {
    it("Deve fazer upload de imagem de perfil sem deletar imagem antiga", async () => {
      const mockBuffer = Buffer.from("profile-image");
      const mockResult = {
        url: "https://cloudinary.com/profile.jpg",
        publicId: "test-folder/profiles/profile_user123",
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, {
            secure_url: mockResult.url,
            public_id: mockResult.publicId,
          });
          return {
            end: jest.fn(),
          };
        }
      );

      const result = await uploadService.uploadProfileImage(
        mockBuffer,
        "user123"
      );

      expect(result).toEqual(mockResult);
      expect(mockDestroy).not.toHaveBeenCalled();
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({
          folder: "test-folder/profiles",
          public_id: "profile_user123",
        }),
        expect.any(Function)
      );
    });

    it("Deve deletar imagem antiga antes de fazer upload", async () => {
      const mockBuffer = Buffer.from("profile-image");
      const oldPublicId = "old-profile-id";
      const mockResult = {
        url: "https://cloudinary.com/new-profile.jpg",
        publicId: "test-folder/profiles/profile_user123",
      };

      mockDestroy.mockResolvedValue({ result: "ok" });

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, {
            secure_url: mockResult.url,
            public_id: mockResult.publicId,
          });
          return {
            end: jest.fn(),
          };
        }
      );

      const result = await uploadService.uploadProfileImage(
        mockBuffer,
        "user123",
        oldPublicId
      );

      expect(mockDestroy).toHaveBeenCalledWith(oldPublicId);
      expect(result).toEqual(mockResult);
    });

    it("Deve continuar upload mesmo se deleção falhar", async () => {
      const mockBuffer = Buffer.from("profile-image");
      const oldPublicId = "old-profile-id";
      const mockResult = {
        url: "https://cloudinary.com/new-profile.jpg",
        publicId: "test-folder/profiles/profile_user123",
      };

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockDestroy.mockRejectedValue(new Error("Delete failed"));

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, {
            secure_url: mockResult.url,
            public_id: mockResult.publicId,
          });
          return {
            end: jest.fn(),
          };
        }
      );

      const result = await uploadService.uploadProfileImage(
        mockBuffer,
        "user123",
        oldPublicId
      );

      expect(mockDestroy).toHaveBeenCalledWith(oldPublicId);
      expect(result).toEqual(mockResult);

      consoleErrorSpy.mockRestore();
    });
  });

  describe("uploadBannerImage", () => {
    it("Deve fazer upload de banner sem deletar imagem antiga", async () => {
      const mockBuffer = Buffer.from("banner-image");
      const mockResult = {
        url: "https://cloudinary.com/banner.jpg",
        publicId: "test-folder/banners/banner_user123",
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, {
            secure_url: mockResult.url,
            public_id: mockResult.publicId,
          });
          return {
            end: jest.fn(),
          };
        }
      );

      const result = await uploadService.uploadBannerImage(
        mockBuffer,
        "user123"
      );

      expect(result).toEqual(mockResult);
      expect(mockDestroy).not.toHaveBeenCalled();
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({
          folder: "test-folder/banners",
          public_id: "banner_user123",
        }),
        expect.any(Function)
      );
    });

    it("Deve deletar banner antigo antes de fazer upload", async () => {
      const mockBuffer = Buffer.from("banner-image");
      const oldPublicId = "old-banner-id";
      const mockResult = {
        url: "https://cloudinary.com/new-banner.jpg",
        publicId: "test-folder/banners/banner_user123",
      };

      mockDestroy.mockResolvedValue({ result: "ok" });

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, {
            secure_url: mockResult.url,
            public_id: mockResult.publicId,
          });
          return {
            end: jest.fn(),
          };
        }
      );

      const result = await uploadService.uploadBannerImage(
        mockBuffer,
        "user123",
        oldPublicId
      );

      expect(mockDestroy).toHaveBeenCalledWith(oldPublicId);
      expect(result).toEqual(mockResult);
    });

    it("Deve continuar upload mesmo se deleção falhar", async () => {
      const mockBuffer = Buffer.from("banner-image");
      const oldPublicId = "old-banner-id";
      const mockResult = {
        url: "https://cloudinary.com/new-banner.jpg",
        publicId: "test-folder/banners/banner_user123",
      };

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockDestroy.mockRejectedValue(new Error("Delete failed"));

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, {
            secure_url: mockResult.url,
            public_id: mockResult.publicId,
          });
          return {
            end: jest.fn(),
          };
        }
      );

      const result = await uploadService.uploadBannerImage(
        mockBuffer,
        "user123",
        oldPublicId
      );

      expect(mockDestroy).toHaveBeenCalledWith(oldPublicId);
      expect(result).toEqual(mockResult);

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Edge Cases", () => {
    it("Deve lidar com buffer vazio", async () => {
      const mockBuffer = Buffer.from("");
      const mockResult = {
        secure_url: "https://cloudinary.com/empty.jpg",
        public_id: "test-id",
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, mockResult);
          return {
            end: jest.fn(),
          };
        }
      );

      const result = await uploadService.uploadImage(mockBuffer, "profiles");

      expect(result).toEqual({
        url: mockResult.secure_url,
        publicId: mockResult.public_id,
      });
    });

    it("Deve lidar com userId vazio em uploadProfileImage", async () => {
      const mockBuffer = Buffer.from("image");
      const mockResult = {
        url: "https://cloudinary.com/profile.jpg",
        publicId: "test-folder/profiles/profile_",
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, {
            secure_url: mockResult.url,
            public_id: mockResult.publicId,
          });
          return {
            end: jest.fn(),
          };
        }
      );

      const result = await uploadService.uploadProfileImage(mockBuffer, "");

      expect(result.publicId).toBe(mockResult.publicId);
    });

    it("Deve lidar com diferentes folders", async () => {
      const mockBuffer = Buffer.from("image");
      const mockResult = {
        secure_url: "https://cloudinary.com/custom.jpg",
        public_id: "test-folder/custom-folder/test-id",
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          callback(null, mockResult);
          return {
            end: jest.fn(),
          };
        }
      );

      await uploadService.uploadImage(mockBuffer, "custom-folder", "test-id");

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({
          folder: "test-folder/custom-folder",
        }),
        expect.any(Function)
      );
    });
  });
});
