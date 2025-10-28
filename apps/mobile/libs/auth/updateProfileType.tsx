import axios from "axios";

interface updateProfileParams {
  userName: string;
  profileType: string;
}

export async function updateProfileType({ userName, profileType }: updateProfileParams) {
  try {
    const response = await axios.put(`http://localhost:4000/users/${userName}`, {
      userName,
      profileType,
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      // O servidor respondeu com um status != 2__
      return {
        error: error.response.data.error || "Erro ao atualizar [profileType].",
      };
    } else if (error.request) {
      console.error("Sem resposta do servidor:", error.request);
      throw new Error("Não foi possível conectar ao servidor.");
    } else {
      console.error("Erro ao registrar usuário:", error.message);
      throw new Error("Erro inesperado ao atualizar [profileType].");
    }
  }
}
