# 📸 Implementação de Upload de Imagens com Cloudinary

## 📋 Visão Geral
Este documento mapeia todos os TODOs necessários para implementar suporte a **imagens de perfil (avatar)** e **banner** para usuários usando **Cloudinary** como serviço de host.

---

## 🔧 1. CONFIGURAÇÃO DE AMBIENTE

### ✅ TODO: Adicionar variáveis ao arquivo `.env`
**Arquivo:** `/apps/api/.env`

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=ra-aton-users  # pasta onde serão armazenadas as imagens
```

### ✅ TODO: Atualizar schema de validação de ambiente
**Arquivo:** `/apps/api/src/config/env.ts`

```typescript
// Adicionar ao envSchema:
const envSchema = z.object({
  // ... existing fields ...
  
  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME não pode estar vazio"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY não pode estar vazio"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET não pode estar vazio"),
  CLOUDINARY_FOLDER: z.string().default("ra-aton-users"),
});
```

---

## 📦 2. INSTALAÇÃO DE PACOTES

### ✅ TODO: Instalar dependências necessárias
**Executar no terminal:**

```bash
cd apps/api
pnpm add cloudinary multer
pnpm add -D @types/multer
```

**Pacotes:**
- `cloudinary` - SDK oficial do Cloudinary
- `multer` - Middleware para processar multipart/form-data
- `@types/multer` - Tipos TypeScript para Multer

---

## 🗄️ 3. SCHEMA DO BANCO DE DADOS (PRISMA)

### ✅ TODO: Adicionar campos de imagem ao modelo User
**Arquivo:** `/apps/api/prisma/schema.prisma`

```prisma
model User {
  id           String       @id @default(uuid())
  name         String
  email        String       @unique
  userName     String       @unique
  profileType  ProfileType?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  passwordHash String
  notificationsAllowed Boolean @default(true)
  
  // ✅ NOVOS CAMPOS PARA IMAGENS
  profileImageUrl  String?  // URL da imagem de perfil no Cloudinary
  bannerImageUrl   String?  // URL do banner no Cloudinary
  profileImageId   String?  // Public ID do Cloudinary (para deletar)
  bannerImageId    String?  // Public ID do Cloudinary (para deletar)

  // ... resto das relationships
}
```

### ✅ TODO: Criar migration
**Executar após modificar o schema:**

```bash
cd apps/api
pnpm prisma migrate dev --name add_user_images
pnpm prisma generate
```

---

## ⚙️ 4. CONFIGURAÇÃO DO CLOUDINARY

### ✅ TODO: Criar arquivo de configuração do Cloudinary
**Arquivo:** `/apps/api/src/config/cloudinary.ts`

```typescript
import { v2 as cloudinary } from 'cloudinary';
import { config } from './env';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

---

## 🛡️ 5. MIDDLEWARE DE UPLOAD

### ✅ TODO: Criar middleware Multer para processar arquivos
**Arquivo:** `/apps/api/src/middlewares/uploadMiddleware.ts`

```typescript
import multer from 'multer';
import { Request } from 'express';
import { ApiError } from '../utils/ApiError';
import httpStatus from 'http-status';

// Configurar armazenamento em memória (Cloudinary receberá o buffer)
const storage = multer.memoryStorage();

// Filtro de tipo de arquivo
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Aceitar apenas imagens
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(httpStatus.BAD_REQUEST, 'Apenas arquivos de imagem são permitidos!'));
  }
};

// Configuração do Multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
});

// Middleware específico para upload de perfil (aceita profileImage e bannerImage)
export const uploadUserImages = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 }
]);

// Middleware para upload apenas de imagem de perfil
export const uploadProfileImage = upload.single('profileImage');

// Middleware para upload apenas de banner
export const uploadBannerImage = upload.single('bannerImage');
```

---

## 🎯 6. SERVIÇO DE UPLOAD

### ✅ TODO: Criar serviço para gerenciar uploads no Cloudinary
**Arquivo:** `/apps/api/src/modules/user/upload.service.ts`

```typescript
import cloudinary from '../../config/cloudinary';
import { config } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import httpStatus from 'http-status';

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
    publicId?: string
  ): Promise<UploadResult> => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `${config.CLOUDINARY_FOLDER}/${folder}`,
          public_id: publicId,
          overwrite: publicId ? true : false,
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Erro ao fazer upload da imagem'));
          }
          if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        }
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
      console.error('Erro ao deletar imagem do Cloudinary:', error);
      // Não lançar erro para não quebrar o fluxo se a imagem já foi deletada
    }
  },

  /**
   * Upload de imagem de perfil
   */
  uploadProfileImage: async (
    fileBuffer: Buffer,
    userId: string,
    oldPublicId?: string
  ): Promise<UploadResult> => {
    // Deletar imagem antiga se existir
    if (oldPublicId) {
      await uploadService.deleteImage(oldPublicId);
    }

    return uploadService.uploadImage(
      fileBuffer,
      'profiles',
      `profile_${userId}`
    );
  },

  /**
   * Upload de banner
   */
  uploadBannerImage: async (
    fileBuffer: Buffer,
    userId: string,
    oldPublicId?: string
  ): Promise<UploadResult> => {
    // Deletar banner antigo se existir
    if (oldPublicId) {
      await uploadService.deleteImage(oldPublicId);
    }

    return uploadService.uploadImage(
      fileBuffer,
      'banners',
      `banner_${userId}`
    );
  },
};
```

---

## 🔄 7. ATUALIZAÇÃO DO USER SERVICE

### ✅ TODO: Adicionar métodos para upload de imagens
**Arquivo:** `/apps/api/src/modules/user/user.service.ts`

```typescript
// Adicionar ao final do userService:

/**
 * Atualiza imagem de perfil do usuário
 */
updateProfileImage: async (
  userId: string,
  fileBuffer: Buffer
): Promise<UserResponse> => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Usuário não encontrado');
  }

  // Upload da nova imagem
  const { url, publicId } = await uploadService.uploadProfileImage(
    fileBuffer,
    userId,
    user.profileImageId || undefined
  );

  // Atualizar no banco
  const updatedUser = await userRepository.update(userId, {
    profileImageUrl: url,
    profileImageId: publicId,
  });

  const { passwordHash, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
},

/**
 * Atualiza banner do usuário
 */
updateBannerImage: async (
  userId: string,
  fileBuffer: Buffer
): Promise<UserResponse> => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Usuário não encontrado');
  }

  // Upload do novo banner
  const { url, publicId } = await uploadService.uploadBannerImage(
    fileBuffer,
    userId,
    user.bannerImageId || undefined
  );

  // Atualizar no banco
  const updatedUser = await userRepository.update(userId, {
    bannerImageUrl: url,
    bannerImageId: publicId,
  });

  const { passwordHash, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
},

/**
 * Deleta imagem de perfil do usuário
 */
deleteProfileImage: async (userId: string): Promise<UserResponse> => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Usuário não encontrado');
  }

  if (user.profileImageId) {
    await uploadService.deleteImage(user.profileImageId);
  }

  const updatedUser = await userRepository.update(userId, {
    profileImageUrl: null,
    profileImageId: null,
  });

  const { passwordHash, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
},

/**
 * Deleta banner do usuário
 */
deleteBannerImage: async (userId: string): Promise<UserResponse> => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Usuário não encontrado');
  }

  if (user.bannerImageId) {
    await uploadService.deleteImage(user.bannerImageId);
  }

  const updatedUser = await userRepository.update(userId, {
    bannerImageUrl: null,
    bannerImageId: null,
  });

  const { passwordHash, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
},
```

---

## 🎮 8. ATUALIZAÇÃO DO USER CONTROLLER

### ✅ TODO: Adicionar métodos no controller para upload
**Arquivo:** `/apps/api/src/modules/user/user.controller.ts`

```typescript
// Adicionar ao final da classe UserController:

/**
 * Upload de imagem de perfil
 */
async uploadProfileImage(req: Request, res: Response) {
  const authUserId = (req as any).user!.id;
  
  if (!req.file) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Nenhuma imagem foi enviada',
    });
  }

  const updatedUser = await userService.updateProfileImage(
    authUserId,
    req.file.buffer
  );

  return res.status(HttpStatus.OK).json(updatedUser);
}

/**
 * Upload de banner
 */
async uploadBannerImage(req: Request, res: Response) {
  const authUserId = (req as any).user!.id;
  
  if (!req.file) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Nenhuma imagem foi enviada',
    });
  }

  const updatedUser = await userService.updateBannerImage(
    authUserId,
    req.file.buffer
  );

  return res.status(HttpStatus.OK).json(updatedUser);
}

/**
 * Deletar imagem de perfil
 */
async deleteProfileImage(req: Request, res: Response) {
  const authUserId = (req as any).user!.id;

  const updatedUser = await userService.deleteProfileImage(authUserId);

  return res.status(HttpStatus.OK).json(updatedUser);
}

/**
 * Deletar banner
 */
async deleteBannerImage(req: Request, res: Response) {
  const authUserId = (req as any).user!.id;

  const updatedUser = await userService.deleteBannerImage(authUserId);

  return res.status(HttpStatus.OK).json(updatedUser);
}
```

---

## 🛣️ 9. NOVAS ROTAS

### ✅ TODO: Adicionar rotas de upload ao user.routes.ts
**Arquivo:** `/apps/api/src/modules/user/user.routes.ts`

```typescript
// Adicionar imports no topo:
import { uploadProfileImage, uploadBannerImage } from '../../middlewares/uploadMiddleware';

// Adicionar no final do arquivo, antes do export:

// ===================================
// Rotas de Upload de Imagens (Protegidas)
// ===================================

/**
 * POST /api/v1/users/upload/profile
 * Faz upload da imagem de perfil do usuário autenticado
 */
router.post(
  '/upload/profile',
  auth, // Requer autenticação
  uploadProfileImage, // Middleware Multer
  catchAsync(userController.uploadProfileImage),
);

/**
 * POST /api/v1/users/upload/banner
 * Faz upload do banner do usuário autenticado
 */
router.post(
  '/upload/banner',
  auth,
  uploadBannerImage,
  catchAsync(userController.uploadBannerImage),
);

/**
 * DELETE /api/v1/users/upload/profile
 * Deleta a imagem de perfil do usuário autenticado
 */
router.delete(
  '/upload/profile',
  auth,
  catchAsync(userController.deleteProfileImage),
);

/**
 * DELETE /api/v1/users/upload/banner
 * Deleta o banner do usuário autenticado
 */
router.delete(
  '/upload/banner',
  auth,
  catchAsync(userController.deleteBannerImage),
);
```

---

## ✅ 10. VALIDAÇÃO DE IMAGENS

### ✅ TODO: Adicionar validações no middleware
**Arquivo:** `/apps/api/src/middlewares/uploadMiddleware.ts`

Já incluído no código do middleware acima:
- ✅ Apenas arquivos de imagem são aceitos
- ✅ Limite de 5MB por arquivo
- ✅ Tratamento de erros apropriado

---

## 📱 11. INTEGRAÇÃO COM EXPO/EAS (FRONTEND)

### ✅ TODO: Exemplo de chamada no frontend

```typescript
// Exemplo de como o frontend deve enviar a imagem

const uploadProfileImage = async (imageUri: string, token: string) => {
  const formData = new FormData();
  
  // Converter URI para blob/file
  const response = await fetch(imageUri);
  const blob = await response.blob();
  
  formData.append('profileImage', {
    uri: imageUri,
    type: 'image/jpeg', // ou image/png
    name: 'profile.jpg',
  } as any);

  const result = await fetch('http://your-api.com/api/v1/users/upload/profile', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // NÃO adicionar Content-Type, o FormData já configura automaticamente
    },
    body: formData,
  });

  return result.json();
};

// Mesmo padrão para banner
const uploadBannerImage = async (imageUri: string, token: string) => {
  const formData = new FormData();
  
  const response = await fetch(imageUri);
  const blob = await response.blob();
  
  formData.append('bannerImage', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'banner.jpg',
  } as any);

  const result = await fetch('http://your-api.com/api/v1/users/upload/banner', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  return result.json();
};
```

---

## 🧪 12. TESTES

### ✅ TODO: Criar testes para upload de imagens
**Arquivo:** `/apps/api/src/__tests__/users/user.upload.test.ts`

```typescript
import request from 'supertest';
import app from '../../app';
import { prismaMock } from '../prisma-mock';
import path from 'path';

describe('User Image Upload', () => {
  let authToken: string;
  const userId = 'test-user-id';

  beforeAll(async () => {
    // TODO: Gerar token de autenticação para testes
    authToken = 'test-jwt-token';
  });

  describe('POST /api/v1/users/upload/profile', () => {
    it('deve fazer upload de imagem de perfil com sucesso', async () => {
      const imagePath = path.join(__dirname, '../fixtures/test-image.jpg');

      const response = await request(app)
        .post('/api/v1/users/upload/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('profileImage', imagePath);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('profileImageUrl');
      expect(response.body).toHaveProperty('profileImageId');
    });

    it('deve rejeitar upload sem imagem', async () => {
      const response = await request(app)
        .post('/api/v1/users/upload/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('deve rejeitar arquivo que não é imagem', async () => {
      const filePath = path.join(__dirname, '../fixtures/test-document.pdf');

      const response = await request(app)
        .post('/api/v1/users/upload/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('profileImage', filePath);

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/users/upload/profile', () => {
    it('deve deletar imagem de perfil com sucesso', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: userId,
        profileImageId: 'old-image-id',
        // ... outros campos
      } as any);

      const response = await request(app)
        .delete('/api/v1/users/upload/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.profileImageUrl).toBeNull();
    });
  });

  // TODO: Adicionar testes similares para banner
});
```

---

## 📝 13. TRATAMENTO DE ERROS

### ✅ TODO: Adicionar tratamento de erros do Multer
**Arquivo:** `/apps/api/src/middlewares/errorHandler.ts`

```typescript
// Adicionar ao errorHandler existente:

import multer from 'multer';

// No middleware errorHandler, adicionar antes do final:
if (err instanceof multer.MulterError) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'Arquivo muito grande. Tamanho máximo: 5MB',
    });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      message: 'Campo de arquivo inesperado',
    });
  }
  return res.status(400).json({
    message: `Erro no upload: ${err.message}`,
  });
}
```

---

## 🔒 14. SEGURANÇA E BOAS PRÁTICAS

### ✅ Checklist de Segurança

- [ ] **Validação de tipo de arquivo** - Apenas imagens são aceitas
- [ ] **Limite de tamanho** - Máximo 5MB por arquivo
- [ ] **Sanitização de nomes** - Usar IDs do usuário como nome
- [ ] **Autenticação obrigatória** - Todas as rotas de upload requerem JWT
- [ ] **Rate limiting** - Considerar adicionar limite de uploads por tempo
- [ ] **Transformações automáticas** - Cloudinary otimiza automaticamente
- [ ] **HTTPS obrigatório** - Em produção, usar apenas HTTPS
- [ ] **Deletar imagens antigas** - Ao fazer novo upload, deletar a anterior

---

## 🚀 15. DEPLOYMENT

### ✅ TODO: Configurar variáveis no ambiente de produção

**Heroku/Railway/Vercel:**
```bash
# Configurar variáveis de ambiente
CLOUDINARY_CLOUD_NAME=your_production_cloud_name
CLOUDINARY_API_KEY=your_production_api_key
CLOUDINARY_API_SECRET=your_production_api_secret
CLOUDINARY_FOLDER=ra-aton-users-prod
```

**Docker:**
```yaml
# docker-compose.yml
environment:
  - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
  - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
  - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
```

---

## 📊 16. MONITORAMENTO

### ✅ TODO: Adicionar logs de upload

```typescript
// No uploadService, adicionar logs:
console.log(`[UPLOAD] Iniciando upload para usuário: ${userId}`);
console.log(`[UPLOAD] Upload concluído. URL: ${result.secure_url}`);
console.log(`[DELETE] Deletando imagem: ${publicId}`);
```

---

## 📖 17. DOCUMENTAÇÃO DA API

### ✅ Endpoints de Upload de Imagens

#### POST `/api/v1/users/upload/profile`
Faz upload da imagem de perfil do usuário autenticado

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Body (form-data):**
```
profileImage: <arquivo de imagem>
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Nome do Usuário",
  "userName": "username",
  "email": "email@example.com",
  "profileImageUrl": "https://res.cloudinary.com/...",
  "profileImageId": "ra-aton-users/profiles/profile_uuid",
  "bannerImageUrl": null,
  "bannerImageId": null,
  "createdAt": "2025-12-06T00:00:00.000Z",
  "updatedAt": "2025-12-06T00:00:00.000Z"
}
```

#### POST `/api/v1/users/upload/banner`
Faz upload do banner do usuário autenticado

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Body (form-data):**
```
bannerImage: <arquivo de imagem>
```

**Response:** Igual ao endpoint de profile

#### DELETE `/api/v1/users/upload/profile`
Remove a imagem de perfil do usuário autenticado

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Nome do Usuário",
  "userName": "username",
  "email": "email@example.com",
  "profileImageUrl": null,
  "profileImageId": null,
  "bannerImageUrl": "https://res.cloudinary.com/...",
  "bannerImageId": "ra-aton-users/banners/banner_uuid",
  "createdAt": "2025-12-06T00:00:00.000Z",
  "updatedAt": "2025-12-06T00:00:00.000Z"
}
```

#### DELETE `/api/v1/users/upload/banner`
Remove o banner do usuário autenticado

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:** Igual ao endpoint de profile delete

---

## ✅ CHECKLIST COMPLETO DE IMPLEMENTAÇÃO

### Configuração Base
- [ ] Adicionar variáveis ao `.env`
- [ ] Atualizar `env.ts` com validação Zod
- [ ] Instalar pacotes (`cloudinary`, `multer`, `@types/multer`)
- [ ] Criar arquivo `cloudinary.ts` de configuração

### Banco de Dados
- [ ] Atualizar `schema.prisma` com campos de imagem
- [ ] Executar migration
- [ ] Executar `prisma generate`

### Middlewares e Serviços
- [ ] Criar `uploadMiddleware.ts`
- [ ] Criar `upload.service.ts`
- [ ] Atualizar `errorHandler.ts` com tratamento Multer

### Módulo User
- [ ] Adicionar métodos no `user.service.ts`
- [ ] Adicionar métodos no `user.controller.ts`
- [ ] Adicionar rotas no `user.routes.ts`

### Testes
- [ ] Criar `user.upload.test.ts`
- [ ] Adicionar imagens de teste em `fixtures/`
- [ ] Executar testes e garantir cobertura

### Deploy e Documentação
- [ ] Configurar variáveis no ambiente de produção
- [ ] Testar upload em staging
- [ ] Documentar endpoints na documentação da API
- [ ] Comunicar frontend sobre novos endpoints

---

## 🎉 CONCLUSÃO

Após implementar todos os TODOs acima, a aplicação terá suporte completo para:
- ✅ Upload de imagens de perfil
- ✅ Upload de banners
- ✅ Deletar imagens existentes
- ✅ Validação de tipo e tamanho
- ✅ Otimização automática via Cloudinary
- ✅ Segurança com autenticação JWT
- ✅ Tratamento adequado de erros

**Próximos passos recomendados:**
1. Implementar rate limiting para uploads
2. Adicionar suporte para crop de imagens no frontend
3. Implementar cache de imagens
4. Adicionar analytics de uso de storage
