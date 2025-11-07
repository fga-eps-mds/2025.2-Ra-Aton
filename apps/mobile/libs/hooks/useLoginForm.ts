import { useState, useMemo } from "react";
import { verifyEmail } from "@/libs/validation/userDataValidation";
import { handleLogin } from "@/libs/auth/handleLogin";
import { useRouter } from "expo-router";
import { useUser } from "@/libs/storage/UserContext";
import { Alert } from "react-native";

interface LoginResponse {
  token: string;
  user: {
    name: string;
    userName: string;
    email: string;
    profileType: string | null;
  };
}

export const useLoginForm = () => {
  const router = useRouter();
  const { setUser } = useUser();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = useMemo(
    () => !verifyEmail(formData.email),
    [formData.email],
  );
  const isPasswordValid = useMemo(
    () => formData.password.length > 0,
    [formData.password],
  );

  const isButtonDisabled = useMemo(() => {
    return isLoading || !isEmailValid || !isPasswordValid;
  }, [
    formData.email,
    formData.password,
    isLoading,
    isEmailValid,
    isPasswordValid,
  ]);

  const handleSubmit = async () => {
    console.log("Enviando dados do login...");
    try {
      setIsLoading(true);
      setError(null);
      const data: LoginResponse = await handleLogin(
        formData.email,
        formData.password,
      );
      console.log("Resposta do servidor. Data => ", data);

      if (data && data.token && data.user) {
        setUser({
          name: data.user.name,
          userName: data.user.userName,
          email: data.user.email,
          token: data.token,
          profileType: data.user.profileType ?? null,
        });

        if (
          data.user.profileType === null ||
          typeof data.user.profileType === "undefined"
        ) {
          router.replace("/formsCadastro");
        } else {
          switch (data.user.profileType) {
          case "JOGADOR":
            router.replace("/(DashBoard)/(tabs)/Partidas");
            break;
          case "TORCEDOR":
            router.replace("/(DashBoard)/(tabs)/Home");
            break;
          case "ATLETICA":
            router.replace("/(DashBoard)/(tabs)/Teams");
            break;
          default:
            router.replace("/(DashBoard)/(tabs)/Home");
        }
        }
      } else {
        throw new Error(
          "Resposta inválida do servidor / Token não encontrado / Erro ao efetuar login",
        );
      }
    } catch (error: any) {
      console.log("Erro no envio do formulário: ", error.message);
      Alert.alert("Erro de conexão", error.message);
      setError(error.message || "Erro desconhecido ao tentar login.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    isLoading,
    error,
    isButtonDisabled,
    handleSubmit,
  };
};
