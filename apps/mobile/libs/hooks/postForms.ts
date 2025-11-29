import { useState } from "react";
import { Alert } from "react-native";
import { useUser } from "@/libs/storage/UserContext";
import { useRouter } from "expo-router";
import { createPost } from "@/libs/criar/createPost";

export const postForms = (selectedGroupId: string | null) => {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const [formsData, setFormData] = useState({
    titulo: "",
    descricao: "",
  });

  const [formError, setFormError] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setFormError("");
      console.log('[postForms] handleSubmit - selectedGroupId:', selectedGroupId);
      if (!user) {
        Alert.alert("Erro", "Usuário não encontrado, faça login novamente.");
        router.replace("/(Auth)/login");
        return;
      }

      // Campos Obrigatórios
      if (!formsData.titulo) {
        Alert.alert("Erro", "Preencha os campos obrigatórios: Título");
        return;
      }

      if (!selectedGroupId) {
        Alert.alert("Erro", "Selecione um grupo para criar o post");
        return;
      }

      // Envia ao backend
      console.log('[postForms] Chamando createPost com groupId:', selectedGroupId);
      const result = await createPost({
        title: formsData.titulo,
        type: "GENERAL",
        content: formsData.descricao?.trim() || undefined,
        token: user.token,
        groupId: selectedGroupId,
      });

      if (result.error) {
        setFormError(result.error); // aparece no formulário
        return;
      }

      Alert.alert("Sucesso", "Post criado com sucesso!");
      console.log("Post criado:", result);

      // Limpa formulário
      setFormData({
        titulo: "",
        descricao: "",
      });

      // Redireciona
      router.replace("/(DashBoard)/(tabs)/Home");
    } catch (error: any) {
      Alert.alert("Erro ao criar post", error?.message || "Tente novamente");
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const comebackPage = () => {
    router.push("/(DashBoard)/(tabs)/NovoPost");
  };

  const isDisabled = loading || !formsData.titulo || !selectedGroupId;

  return {
    formsData,
    setFormData,
    loading,
    isDisabled,
    handleSubmit,
    comebackPage,
    formError,
    setFormError,
  };
};
