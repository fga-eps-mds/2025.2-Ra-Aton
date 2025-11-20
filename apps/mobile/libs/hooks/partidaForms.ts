import { useState } from "react";
import { Alert } from "react-native";
import { useUser } from "@/libs/storage/UserContext";
import { useRouter } from "expo-router";
import { createPartida } from "@/libs/criar/createPartida";

export const partidaForms = () => {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
    
  const [formsData, setFormData] = useState({
    titulo: "",
    descricao: "",
    esporte: "",
    maxPlayers: 6,
    nomeEquipeA: "",
    nomeEquipeB: "",
    dataInicio: "",
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
      if (!formsData.titulo || !formsData.dataInicio || !formsData.local || !formsData.esporte) {
        Alert.alert(
          "Erro",
          "Preencha os campos obrigatórios: Título, Data Início, Local e Esporte",
        );
        return;
      }

      // Envia ao backend
      const result = await createPartida({
        author: user,
        userId: user.id,
        title: formsData.titulo,
        description: formsData.descricao?.trim() || undefined,
        sport: formsData.esporte,
        maxPlayers: formsData.maxPlayers,
        teamNameA: formsData.nomeEquipeA?.trim() || undefined,
        teamNameB: formsData.nomeEquipeB?.trim() || undefined,
        MatchDate: formsData.dataInicio,
        location: formsData.local,
        token: user.token,
      });

      if (result.error) {
        setFormError(result.error); // aparece no formulário
        return;
      }

      Alert.alert("Sucesso", "Partida criado com sucesso!");
      console.log("Partida criado:", result);

      // Limpa formulário
      setFormData({
        titulo: "",
        descricao: "",
        esporte: "",
        maxPlayers: 6,
        nomeEquipeA: "",
        nomeEquipeB: "",
        dataInicio: "",
        local: "",
      });

      // Redireciona
      router.replace("/(DashBoard)/(tabs)/Partidas");
    } catch (error: any) {
      Alert.alert("Erro ao criar partida", error?.message || "Tente novamente");
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const comebackPage = () => {
    router.push("/(DashBoard)/(tabs)/NovoPost");
  };

  const isDisabled =
    loading || !formsData.titulo || !formsData.dataInicio || !formsData.local || !formsData.esporte;

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
