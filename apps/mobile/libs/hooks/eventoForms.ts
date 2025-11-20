import { useState } from "react";
import { Alert } from "react-native";
import { useUser } from "@/libs/storage/UserContext";
import { useRouter } from "expo-router";
import { createEvent } from "@/libs/criar/createEvento";

export const eventoForms = () => {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const [formsData, setFormData] = useState({
    titulo: "",
    descricao: "",
    dataInicio: "",
    dataFim: "",
    local: "",
  });

  const [formError, setFormError] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setFormError("");
      if (!user) {
        Alert.alert("Erro", "Usuário não encontrado, faça login novamente.");
        router.replace("/(Auth)/login");
        return;
      }

      // Campos obrigatórios
      if (!formsData.titulo || !formsData.dataInicio || !formsData.local) {
        Alert.alert(
          "Erro",
          "Preencha os campos obrigatórios: Título, Data Início e Local",
        );
        return;
      }

      // Envia ao backend
      const result = await createEvent({
        title: formsData.titulo,
        type: "EVENT",
        content: formsData.descricao,
        eventDate: formsData.dataInicio,
        eventFinishDate: formsData.dataFim,
        location: formsData.local,
        token: user.token,
      });

      if (result.error) {
        setFormError(result.error); // aparece no formulário
        return;
      }

      Alert.alert("Sucesso", "Evento criado com sucesso!");
      console.log("Evento criado:", result);

      // Limpa formulário
      setFormData({
        titulo: "",
        descricao: "",
        dataInicio: "",
        dataFim: "",
        local: "",
      });

      // Redireciona
      router.replace("/(DashBoard)/(tabs)/Home");
    } catch (error: any) {
      Alert.alert("Erro ao criar evento", error?.message || "Tente novamente");
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const comebackPage = () => {
    router.push("/(DashBoard)/(tabs)/NovoPost");
  };

  const isDisabled =
    loading || !formsData.titulo || !formsData.dataInicio || !formsData.local;

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
