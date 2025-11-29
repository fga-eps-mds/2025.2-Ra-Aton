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
    setError, // Usado para definir erros visuais nos campos
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

  // Validação manual simples (já que removemos o Zod a seu pedido)
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

      const newGroup = await handleCreateGroup(payload);

      // SUCESSO:
      Alert.alert("Sucesso!", `O grupo "${newGroup.name}" foi criado com sucesso!`, [
        {
          text: "Voltar",
          onPress: () => {
            router.replace( "/(Dashboard/(tabs)/(menu))")
            // atilaa09: Por enquando não da pra mandar o usuário pra tela de perfil pois ela nn existe.
                            // <----- Quando existir a tela gente coloca aqui.
          },
        },
      ]);
    } catch (error: any) {
      const errorMessage = error.message || "";

      // ERRO DE UX INTELIGENTE:
      // Se o erro for sobre nome duplicado, marcamos o campo 'name' em vermelho
      // em vez de jogar um popup na cara do usuário.
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
