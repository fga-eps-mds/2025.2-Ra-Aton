import bcrypt from "bcryptjs";
import { sign, Secret, SignOptions } from "jsonwebtoken";
import { User } from "@prisma/client";
import userRepository from "../user/user.repository"; // Reutilizando o repositório!
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import { config } from "../../config/env";

// Helper para formatar a resposta do usuário
const formatUserResponse = (user: User) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    userName: user.userName,
  };
};

class AuthService {
  /**
   * Lógica de negócio para autenticar um usuário.
   */
  async login(email: string, passwordReq: string) {
    // 1. Encontrar o usuário pelo email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Usar uma mensagem genérica para segurança
      throw new ApiError(httpStatus.UNAUTHORIZED, "E-mail não encontrado.");
    }

    // 2. Checar se a conta no banco é válida
    const hashedPassword = user.passwordHash;
    if (!hashedPassword) {
      console.error(`Usuário ${user.id} não possui hash de senha no banco.`);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Conta de usuário inválida.",
      );
    }

    // 3. Comparar a senha da requisição com o hash
    const senhaValida = await bcrypt.compare(passwordReq, hashedPassword);
    if (!senhaValida) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "E-mail ou senha incorretos.",
      );
    }

    // 4. Gerar o token JWT
    const secret: Secret = config.JWT_SECRET as Secret;
    const options: SignOptions = {
      expiresIn: (config.JWT_EXPIRES_IN ?? "1h") as SignOptions["expiresIn"],
    };
    const token = sign({ id: user.id }, secret, options);

    // 5. Checar por "avisos" (lógica de negócio do profileType)
    const warns: string[] = [];
    if (user.profileType === null) {
      warns.push("Configuração de perfil pendente.");
    }

    // 6. Retornar a resposta completa
    return {
      token,
      user: formatUserResponse(user),
      warns: warns,
    };
  }
}

export const authService = new AuthService();
