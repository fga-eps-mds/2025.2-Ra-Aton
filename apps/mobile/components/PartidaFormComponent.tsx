import React, { useState } from "react";
import { View, Platform } from "react-native";
import InputComp from "@/components/InputComp";
import DateTimePicker from "@react-native-community/datetimepicker";
import { DescricaoInput } from "@/components/DescricaoInput";
import AppText from "./AppText";
import InputDateWebComp from "@/components/InputDateWebComp";
import InputDateComp from "@/components/InputDateComp";
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
    const [showPicker, setShowPicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());
    const [editingField, setEditingField] = useState<"inicio" | "fim" | null>(null);
    
    const formatarData = (dataISO: string) => {
    if (!dataISO) return "";
    const data = new Date(dataISO);
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();
    const h = String(data.getHours()).padStart(2, "0");
    const m = String(data.getMinutes()).padStart(2, "0");
    return `${dia}/${mes}/${ano} ${h}:${m}`;
  };

  const handleChangeDate = (event: any, selected?: Date) => {
    if (event.type === "dismissed") {
      setShowPicker(false);
      return;
    }

    const date = selected || tempDate;
    setTempDate(date);
    setShowPicker(false);
    setShowTimePicker(true);
  };

  const handleChangeTime = (event: any, selected?: Date) => {
    if (event.type === "dismissed") {
      setShowTimePicker(false);
      return;
    }

    const finalDate = new Date(tempDate);

    if (selected) {
      finalDate.setHours(selected.getHours());
      finalDate.setMinutes(selected.getMinutes());
    }

    const iso = finalDate.toISOString();

    if (editingField === "inicio") {
      setFormData((prev: any) => ({ ...prev, dataInicio: iso }));
    }
    if (editingField === "fim") {
      setFormData((prev: any) => ({ ...prev, dataFim: iso }));
    }

    setShowTimePicker(false);
  };
    
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


      {Platform.OS === "web" ? (
              <InputDateWebComp
                label="Data Início *"
                value={formsData.dataInicio ? formsData.dataInicio.slice(0, 16) : ""}
                onChange={(value) => {
                  const iso = new Date(value).toISOString();
                  setFormData((prev) => ({ ...prev, dataInicio: iso }));
                }}
              />
            ) : (
              <InputDateComp
                label="Data Início *"
                value={formatarData(formsData.dataInicio)}
                onPress={() => {
                  setEditingField("inicio");
                  setTempDate(formsData.dataInicio ? new Date(formsData.dataInicio) : new Date());
                  setShowPicker(true);
                }}
              />
            )}

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

      {showPicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          onChange={handleChangeDate}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          is24Hour
          onChange={handleChangeTime}
        />
      )}
    </View>
  );
};
