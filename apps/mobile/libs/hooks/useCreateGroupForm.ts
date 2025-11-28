// ARQUIVO: apps/mobile/libs/hooks/useCreateGroupForm.ts
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import {
  handleCreateGroup,
  CreateGroupPayload,
} from "@/libs/group/handleCreateGroup";

export interface CreateGroupFormData {
  name: string;
  description: string;
  type: "ATHLETIC" | "AMATEUR";
  sport: string;
}

export function useCreateGroupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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
      setError("name", {
        type: "manual",
        message: "O nome deve ter pelo menos 2 caracteres",
      });
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

      // 1. Chama a API
      const newGroup = await handleCreateGroup(payload);
      
      // 2. SUCESSO!
      // Não usamos Alert com callback aqui para evitar problemas de contexto.
      // Navegamos IMEDIATAMENTE.
      
      console.log("Redirecionando para:", `/group/${newGroup.id}`);
      
      // Pequeno delay para garantir que o estado de loading não interfira na transição
      setTimeout(() => {
          // Usa 'replace' para não voltar ao formulário
          router.replace({
            pathname: "/group/[id]",
            params: { id: newGroup.id },
          });
          
          // (Opcional) Mostra um alerta DEPOIS de iniciar a navegação, 
          // ou deixa para a próxima tela mostrar um Toast.
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
          message: "Este nome já está em uso. Por favor, escolha outro.",
        });
      } else {
        Alert.alert(
          "Atenção",
          errorMessage || "Ocorreu um erro ao criar o grupo. Tente novamente.",
        );
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
    goBack: router.back,
  };
}