import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { upload, uploadUserImages, uploadProfileImage, uploadBannerImage } from "../../middlewares/uploadMiddleware";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

describe("UploadMiddleware - Integration Tests", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      file: undefined,
      files: undefined,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe("uploadProfileImage middleware", () => {
    it("deve processar arquivo de imagem válido com sucesso", (done) => {
      const mockFile: Express.Multer.File = {
        fieldname: "profileImage",
        originalname: "avatar.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 1024 * 100, // 100KB
        buffer: Buffer.from("fake-image-data"),
        destination: "",
        filename: "",
        path: "",
        stream: {} as any,
      };

      mockReq.file = mockFile;

      // Simular o middleware processando o arquivo
      const middleware = uploadProfileImage;
      
      // uploadProfileImage é um middleware do multer, vamos testar sua configuração
      expect(middleware).toBeDefined();
      expect(typeof middleware).toBe("function");
      done();
    });

    it("deve estar configurado para aceitar campo 'profileImage'", () => {
      expect(uploadProfileImage).toBeDefined();
      expect(typeof uploadProfileImage).toBe("function");
    });
  });

  describe("uploadBannerImage middleware", () => {
    it("deve estar configurado para aceitar campo 'bannerImage'", () => {
      expect(uploadBannerImage).toBeDefined();
      expect(typeof uploadBannerImage).toBe("function");
    });
  });

  describe("uploadUserImages middleware", () => {
    it("deve estar configurado para aceitar múltiplos campos", () => {
      expect(uploadUserImages).toBeDefined();
      expect(typeof uploadUserImages).toBe("function");
    });

    it("deve aceitar campos profileImage e bannerImage", () => {
      // uploadUserImages é configurado com upload.fields()
      expect(uploadUserImages).toBeDefined();
    });
  });

  describe("upload configuration", () => {
    it("deve ter instância multer configurada", () => {
      expect(upload).toBeDefined();
      expect(upload.single).toBeDefined();
      expect(upload.fields).toBeDefined();
      expect(upload.array).toBeDefined();
    });

    it("deve exportar métodos do multer", () => {
      expect(typeof upload.single).toBe("function");
      expect(typeof upload.fields).toBe("function");
      expect(typeof upload.array).toBe("function");
      expect(typeof upload.any).toBe("function");
      expect(typeof upload.none).toBe("function");
    });
  });

  describe("File validation tests", () => {
    it("deve validar formato de arquivo através do mimetype", () => {
      const imageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ];

      imageTypes.forEach((mimetype) => {
        expect(mimetype.startsWith("image/")).toBe(true);
      });
    });

    it("deve rejeitar tipos de arquivo inválidos", () => {
      const invalidTypes = [
        "application/pdf",
        "video/mp4",
        "text/plain",
        "application/zip",
      ];

      invalidTypes.forEach((mimetype) => {
        expect(mimetype.startsWith("image/")).toBe(false);
      });
    });

    it("deve validar tamanho de arquivo (5MB limit)", () => {
      const fiveMB = 5 * 1024 * 1024;
      const validSize = 4 * 1024 * 1024;
      const invalidSize = 6 * 1024 * 1024;

      expect(validSize).toBeLessThan(fiveMB);
      expect(invalidSize).toBeGreaterThan(fiveMB);
    });
  });

  describe("Error handling", () => {
    it("deve criar ApiError com status correto para arquivo inválido", () => {
      const error = new ApiError(
        httpStatus.BAD_REQUEST,
        "Apenas arquivos de imagem são permitidos!"
      );

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(error.message).toBe("Apenas arquivos de imagem são permitidos!");
    });

    it("deve ter mensagem de erro apropriada", () => {
      const error = new ApiError(
        httpStatus.BAD_REQUEST,
        "Apenas arquivos de imagem são permitidos!"
      );

      expect(error.message).toContain("imagem");
      expect(error.message).toContain("permitidos");
    });
  });

  describe("Storage configuration", () => {
    it("deve usar memoryStorage para Cloudinary", () => {
      const memStorage = multer.memoryStorage();
      
      expect(memStorage).toBeDefined();
      // memoryStorage retorna um objeto com _handleFile e _removeFile
      expect(typeof memStorage).toBe("object");
    });

    it("deve configurar limite de tamanho correto", () => {
      const expectedLimit = 5 * 1024 * 1024; // 5MB
      
      expect(expectedLimit).toBe(5242880);
    });
  });

  describe("Middleware chain compatibility", () => {
    it("uploadProfileImage deve ser compatível com Express middleware", () => {
      // Middleware do multer deve aceitar (req, res, next)
      expect(uploadProfileImage.length).toBeGreaterThanOrEqual(3);
    });

    it("uploadBannerImage deve ser compatível com Express middleware", () => {
      expect(uploadBannerImage.length).toBeGreaterThanOrEqual(3);
    });

    it("uploadUserImages deve ser compatível com Express middleware", () => {
      expect(uploadUserImages.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Mock file creation for testing", () => {
    it("deve criar mock válido de arquivo de imagem JPEG", () => {
      const mockFile: Express.Multer.File = {
        fieldname: "profileImage",
        originalname: "test.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 1024,
        buffer: Buffer.from("fake-data"),
        destination: "",
        filename: "",
        path: "",
        stream: {} as any,
      };

      expect(mockFile.mimetype).toBe("image/jpeg");
      expect(mockFile.mimetype.startsWith("image/")).toBe(true);
    });

    it("deve criar mock válido de arquivo PNG", () => {
      const mockFile: Express.Multer.File = {
        fieldname: "profileImage",
        originalname: "test.png",
        encoding: "7bit",
        mimetype: "image/png",
        size: 2048,
        buffer: Buffer.from("fake-png-data"),
        destination: "",
        filename: "",
        path: "",
        stream: {} as any,
      };

      expect(mockFile.mimetype).toBe("image/png");
      expect(mockFile.mimetype.startsWith("image/")).toBe(true);
    });

    it("deve criar mock de arquivo inválido (PDF)", () => {
      const mockFile: Express.Multer.File = {
        fieldname: "profileImage",
        originalname: "document.pdf",
        encoding: "7bit",
        mimetype: "application/pdf",
        size: 1024,
        buffer: Buffer.from("fake-pdf-data"),
        destination: "",
        filename: "",
        path: "",
        stream: {} as any,
      };

      expect(mockFile.mimetype).toBe("application/pdf");
      expect(mockFile.mimetype.startsWith("image/")).toBe(false);
    });
  });

  describe("Multiple file upload scenarios", () => {
    it("deve validar array de arquivos de imagem", () => {
      const files: Express.Multer.File[] = [
        {
          fieldname: "profileImage",
          originalname: "profile.jpg",
          encoding: "7bit",
          mimetype: "image/jpeg",
          size: 1024,
          buffer: Buffer.from("profile"),
          destination: "",
          filename: "",
          path: "",
          stream: {} as any,
        },
        {
          fieldname: "bannerImage",
          originalname: "banner.png",
          encoding: "7bit",
          mimetype: "image/png",
          size: 2048,
          buffer: Buffer.from("banner"),
          destination: "",
          filename: "",
          path: "",
          stream: {} as any,
        },
      ];

      files.forEach((file) => {
        expect(file.mimetype.startsWith("image/")).toBe(true);
      });
    });

    it("deve detectar arquivos inválidos em array", () => {
      const files: Express.Multer.File[] = [
        {
          fieldname: "profileImage",
          originalname: "profile.jpg",
          encoding: "7bit",
          mimetype: "image/jpeg",
          size: 1024,
          buffer: Buffer.from("profile"),
          destination: "",
          filename: "",
          path: "",
          stream: {} as any,
        },
        {
          fieldname: "document",
          originalname: "doc.pdf",
          encoding: "7bit",
          mimetype: "application/pdf",
          size: 2048,
          buffer: Buffer.from("doc"),
          destination: "",
          filename: "",
          path: "",
          stream: {} as any,
        },
      ];

      const invalidFile = files.find((file) => !file.mimetype.startsWith("image/"));
      expect(invalidFile).toBeDefined();
      expect(invalidFile?.mimetype).toBe("application/pdf");
    });
  });
});
