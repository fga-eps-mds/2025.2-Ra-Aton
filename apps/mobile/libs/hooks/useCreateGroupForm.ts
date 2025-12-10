// ARQUIVO: apps/mobile/libs/hooks/useCreateGroupForm.ts
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "expo-router";
import {
  handleCreateGroup,
  CreateGroupPayload,
} from "@/libs/group/handleCreateGroup";

// 1. Importamos nosso wrapper (fácil de testar)
import { showSuccessAlert, showErrorAlert } from "@/libs/utils/alert";

export interface CreateGroupFormData {
  name: string;
  description: string;
  type: "ATHLETIC" | "AMATEUR";
  sport: string;
}

export function useCreateGroupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);
  const [createdGroupName, setCreatedGroupName] = useState<string | null>(null);


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

      setCreatedGroupId(newGroup.id);
      setCreatedGroupName(newGroup.name);

      setTimeout(() => {
        console.log("Navegando para perfilGrupo com ID:", newGroup.id);

        router.push({
          pathname: `/(DashBoard)/(tabs)/Perfil`,
          params: { identifier: newGroup.name, type: "group" },
        });

        // 2. Usamos nossa função wrapper
        showSuccessAlert("Sucesso", `Grupo "${newGroup.name}" criado!`);
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
        // 3. Usamos nossa função wrapper
        showErrorAlert("Erro", errorMessage);
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
    createdGroupId,
    createdGroupName,
    goBack: router.back,
  };
}
