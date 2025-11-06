import { useState } from "react";
import { Alert } from "react-native";
import { useUser } from "@/libs/storage/UserContext";
import { useRouter } from "expo-router";
import { updateProfileType } from "@/libs/auth/updateProfileType";

export const useFormsCadastro = () => {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);

  const sendType = async (profileType: string) => {
    try {
      setLoading(true);
      if (!user) {
        Alert.alert("Erro", "Usuário não encontrado, faça login novamente.");
        router.replace("/(Auth)/login");
        return;
      }

      // Atualiza no backend
      const result = await updateProfileType({
        userName: user.userName,
        profileType,
        token: user.token,
      });
      if (result.error) throw new Error(result.error);

      // Atualiza no contexto
      setUser({ ...user, profileType });
      console.log(`profileType atualizado para: ${profileType}`);

      // Redireciona conforme tipo
      if (profileType === "JOGADOR" || profileType === "TORCEDOR") {
        router.replace("/(DashBoard)/Home");
      } else if (profileType === "ATLETICA") {
        router.replace("/(DashBoard)/Teams");
      } else {
        router.replace("/(DashBoard)/Home");
      }
    } catch (err: any) {
      Alert.alert("Erro ao atualizar", err?.message || String(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const comebackPage = () => {
    router.push("/(Auth)/cadastro");
  };

  return {
    loading,
    sendType,
    comebackPage,
  };
};
