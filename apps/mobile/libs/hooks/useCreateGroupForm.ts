import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";
import {
  handleCreateGroup,
  CreateGroupPayload,
} from "@/libs/group/handleCreateGroup";
import { router } from "expo-router";

export interface CreateGroupFormData {
  name: string;
  description: string;
  type: "ATHLETIC" | "AMATEUR";
  sport: string;
}

export function useCreateGroupForm() {
  const [isLoading, setIsLoading] = useState(false);
  // NOVO ESTADO: Armazena o ID do grupo criado com sucesso
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<CreateGroupFormData>({
    defaultValues: {
      name: "",
      description: "",
      type: "ATHLETIC",
      sport: "",
    },
  });

  const selectedType = watch("type");

  const validateForm = (data: CreateGroupFormData): boolean => {
    let isValid = true;
    if (!data.name || data.name.length < 2) {
      setError("name", { type: "manual", message: "Mínimo 2 caracteres" });
      isValid = false;
    }
    return isValid;
  };

  const onSubmit = async (data: CreateGroupFormData) => {
    if (!validateForm(data)) return;

    setIsLoading(true);
    try {
      const payload: CreateGroupPayload = {
        name: data.name,
        description: data.description || undefined,
        type: data.type,
        verificationRequest: true,
        acceptingNewMembers: true,
        sports: data.sport ? [data.sport] : [],
      };

      const newGroup = await handleCreateGroup(payload);

      // SUCESSO:
      setTimeout(() => {
        console.log("Navegando para perfilGrupo com ID:", newGroup.id);
        router.replace({
          pathname: "/perfilGrupo", // Nome exato do arquivo na raiz
          //params: { id: newGroup.id }, // Isso vira ?id=...
        });

        Alert.alert("Sucesso", `Grupo "${newGroup.name}" criado!`);
      }, 100);
    } catch (error: any) {
      const errorMessage = error.message || "";
      if (
        errorMessage.toLowerCase().includes("nome") &&
        errorMessage.toLowerCase().includes("uso")
      ) {
        setError("name", {
          type: "manual",
          message: "Este nome já está em uso.",
        });
      } else {
        Alert.alert("Erro", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const submitForm = handleSubmit(onSubmit);

  return {
    control,
    errors,
    selectedType,
    setValue,
    submitForm,
    isLoading,
    createdGroupId, // Retornamos o ID para o componente usar
  };
}
