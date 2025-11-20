import React from "react";
import { View } from "react-native";
import InputComp from "@/components/InputComp";
import { DescricaoInput } from "@/components/DescricaoInput";
import AppText from "./AppText";

interface PostFormProps {
  formsData: {
    titulo: string;
    descricao: string;
  };
  setFormData: (data: any) => void;
  formError?: string;
}

export const PostFormComponent: React.FC<PostFormProps> = ({
  formsData,
  setFormData,
  formError,
}) => {
  return (
    <View style={{ width: "100%" }}>
      <InputComp
        label="Título *"
        iconName="document"
        value={formsData.titulo}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, titulo: text }))
        }
        placeholder="Título do post"
      />

      <DescricaoInput
        label="Descrição"
        value={formsData.descricao}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, descricao: text }))
        }
        placeholder="Descreva o post aqui..."
        height={120}
      />

      {formError ? (
        <AppText style={{ color: "red", marginTop: 10, fontSize: 20 }}>
          {formError}
        </AppText>
      ) : null}
    </View>
  );
};
