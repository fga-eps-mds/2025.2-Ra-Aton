// ARQUIVO: apps/mobile/libs/hooks/useCreateGroupForm.ts
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import {
  handleCreateGroup,
  CreateGroupPayload,
} from "@/libs/group/handleCreateGroup";

// Interface local para o formulário
export interface CreateGroupFormData {
  name: string;
  description: string;
  type: "ATHLETIC" | "AMATEUR";
  sport: string;
}

export function useCreateGroupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Configuração do hook-form SEM resolver externo (Zod)
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    setError, // Usado para definir erros manualmente
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

  // Função de validação manual
  const validateForm = (data: CreateGroupFormData): boolean => {
    let isValid = true;

    if (!data.name || data.name.length < 2) {
      setError("name", {
        type: "manual",
        message: "O nome deve ter pelo menos 2 caracteres",
      });
      isValid = false;
    }

    // Descrição é opcional na API, mas se preenchida, min 2 chars
    if (
      data.description &&
      data.description.length > 0 &&
      data.description.length < 2
    ) {
      setError("description", {
        type: "manual",
        message: "A descrição deve ter pelo menos 2 caracteres",
      });
      isValid = false;
    }

    if (!data.type) {
      setError("type", { type: "manual", message: "Selecione um tipo" });
      isValid = false;
    }

    // Validação do esporte (frontend requirement)
    // if (!data.sport || data.sport.length < 2) {
    //   setError('sport', { type: 'manual', message: 'Informe o esporte principal' });
    //   isValid = false;
    // }

    return isValid;
  };

  const onSubmit = async (data: CreateGroupFormData) => {
    // 1. Executa validação manual
    if (!validateForm(data)) return;

    setIsLoading(true);
    try {
      const payload: CreateGroupPayload = {
        name: data.name,
        description: data.description || undefined,
        type: data.type,
        verificationRequest: true, // Hardcoded conforme doc (obrigatório)
        acceptingNewMembers: true,
        sports: data.sport ? [data.sport] : [],
      };

      await handleCreateGroup(payload);

      Alert.alert("Sucesso", "Grupo criado com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Ocorreu um erro ao criar o grupo.");
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
    goBack: router.back,
  };
}
