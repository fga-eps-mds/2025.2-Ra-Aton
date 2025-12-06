import React from "react";
import { View } from "react-native";
import InputComp from "@/components/InputComp";
import { DescricaoInput } from "@/components/DescricaoInput";
import AppText from "./AppText";

interface PartidaFormProps {
  formsData: {
    titulo: string;
    descricao: string;
    esporte: string;
    maxPlayers: number;
    nomeEquipeA: string;
    nomeEquipeB: string;
    dataInicio: string;
    local: string;
  };
  setFormData: (data: any) => void;
  formError?: string;
}

export const PartidaFormComponent: React.FC<PartidaFormProps> = ({
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
        placeholder="Título do partida"
      />

      <DescricaoInput
        label="Descrição"
        value={formsData.descricao}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, descricao: text }))
        }
        placeholder="Descreva o partida aqui..."
        height={120}
      />

        <InputComp
            label="Esporte *"
            iconName="people"
            value={formsData.esporte}
            onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, esporte: text }))
            }
            placeholder="Esporte"
        />

        <InputComp
            label="Numero de participantes *"
            iconName="people"
            value={formsData.maxPlayers.toString()}
            onChangeText={(text) =>{
            const onlyIntegers = text.replace(/[^0-9]/g, "");
            setFormData((prev) => ({ ...prev, maxPlayers: Number(onlyIntegers) }))
            }}
            placeholder="Numero de participantes"
            keyboardType="numeric"
        />

        <InputComp
            label="Nome equipe 1"
            iconName="people"
            value={formsData.nomeEquipeA}
            onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, nomeEquipeA: text }))
            }
            placeholder="Equipe A"
        />

        <InputComp
            label="Nome equipe 2"
            iconName="people"
            value={formsData.nomeEquipeB}
            onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, nomeEquipeB: text }))
            }
            placeholder="Equipe A"
        />


      <InputComp
        label="Data Início *"
        iconName="calendar"
        value={formsData.dataInicio}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, dataInicio: text }))
        }
        placeholder="31/12/2025 22:00"
      />

      <InputComp
        label="Local *"
        iconName="location"
        value={formsData.local}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, local: text }))
        }
        placeholder="Local da partida"
      />
      {formError ? (
        <AppText style={{ color: "red", marginTop: 10, fontSize: 20 }}>
          {formError}
        </AppText>
      ) : null}
    </View>
  );
};
