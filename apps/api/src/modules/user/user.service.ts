import { Prisma, User } from "@prisma/client";
import userRepository from "./user.repository";
import { ApiError } from "../../utils/ApiError"; // Classe de erro customizada
import httpStatus from "http-status";
import bcrypt from "bcryptjs"; // (instale: npm install bcryptjs @types/bcryptjs)
import { uploadService } from "./upload.service";

// Omitir a senha da resposta é uma boa prática
type UserResponse = Omit<User, "passwordHash">;

export const userService = {
  createUser: async (data: any): Promise<UserResponse> => {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(httpStatus.CONFLICT, "Email já cadastrado");
    }
    const existingUserName = await userRepository.findByUserName(data.userName);
    if (existingUserName) {
      throw new ApiError(httpStatus.CONFLICT, "Nome de usuário já cadastrado");
    }

    if (!data.password || typeof data.password !== "string") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Senha é obrigatória e deve ser uma string",
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await userRepository.create({
      name: data.name,
      userName: data.userName,
      email: data.email,
      passwordHash: hashedPassword,
    });

    // Remove a senha antes de retornar
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  getUserById: async (id: string): Promise<UserResponse> => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "Usuário não encontrado");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  getUserByUserName: async (userName: string): Promise<UserResponse> => {
    const user = await userRepository.findByUserName(userName);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "Usuário não encontrado");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  getAllUsers: async (): Promise<UserResponse[]> => {
    const users = await userRepository.findAll();
    return users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  },

  updateUser: async (
    userName: string,
    authUserId: string,
    data: Partial<Prisma.UserUpdateInput>,
  ): Promise<UserResponse> => {
    // 1. Busca o usuário pelo userName
    const userFound = await userRepository.findByUserName(userName);
    if (!userFound) {
      throw new ApiError(httpStatus.NOT_FOUND, "Usuário não encontrado");
    }

    // 2. Verifica se o ID do token JWT é o mesmo do usuário que está sendo alterado
    if (userFound.id !== authUserId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Você não tem permissão para atualizar este usuário",
      );
    }

    // 3. Se houver atualização de senha, faz o hash
    if (data.passwordHash) {
      data.passwordHash = await bcrypt.hash(data.passwordHash as string, 10);
    }

    // 4. Atualiza o usuário
    const updatedUser = await userRepository.update(userFound.id, data);

    // 5. Remove a senha antes de retornar
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  },

  deleteUser: async (userName: string, authUserId: string): Promise<void> => {
    const userFound = await userRepository.findByUserName(userName);
    if (!userFound) {
      throw new ApiError(httpStatus.NOT_FOUND, "Usuário não encontrado");
    }

    // Verifica se o usuário autenticado é o mesmo que está sendo deletado
    if (userFound.id !== authUserId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Você não tem permissão para deletar este usuário",
      );
    }

    await userRepository.delete(userFound.id);
  },

  /**
   * Atualiza imagem de perfil do usuário
   */
  updateProfileImage: async (
    userId: string,
    fileBuffer: Buffer,
  ): Promise<UserResponse> => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "Usuário não encontrado");
    }

    // Upload da nova imagem
    const { url, publicId } = await uploadService.uploadProfileImage(
      fileBuffer,
      userId,
      user.profileImageId || undefined,
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
    fileBuffer: Buffer,
  ): Promise<UserResponse> => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "Usuário não encontrado");
    }

    // Upload do novo banner
    const { url, publicId } = await uploadService.uploadBannerImage(
      fileBuffer,
      userId,
      user.bannerImageId || undefined,
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
      throw new ApiError(httpStatus.NOT_FOUND, "Usuário não encontrado");
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
      throw new ApiError(httpStatus.NOT_FOUND, "Usuário não encontrado");
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
};
