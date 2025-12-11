import React, { useState } from "react";
import { View, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import InputComp from "@/components/InputComp";
import { DescricaoInput } from "@/components/DescricaoInput";
import AppText from "./AppText";
import InputDateWebComp from "@/components/InputDateWebComp";
import InputDateComp from "@/components/InputDateComp";

interface EventFormProps {
  formsData: {
    titulo: string;
    descricao: string;
    dataInicio: string;
    dataFim: string;
    local: string;
  };
  setFormData: (data: any) => void;
  formError?: string;
}

export const EventoFormComponent: React.FC<EventFormProps> = ({
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
        placeholder="Título do evento"
      />

      <DescricaoInput
        label="Descrição"
        value={formsData.descricao}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, descricao: text }))
        }
        placeholder="Descreva o evento aqui..."
        height={120}
      />

      {/* ------------------------ DATA INÍCIO ------------------------ */}
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

      {/* ------------------------ DATA FIM ------------------------ */}
      {Platform.OS === "web" ? (
        <InputDateWebComp
          label="Data Fim"
          value={formsData.dataFim ? formsData.dataFim.slice(0, 16) : ""}
          onChange={(value) => {
            const iso = new Date(value).toISOString();
            setFormData((prev) => ({ ...prev, dataFim: iso }));
          }}
        />
      ) : (
        <InputDateComp
          label="Data Fim"
          value={formatarData(formsData.dataFim)}
          onPress={() => {
            setEditingField("fim");
            setTempDate(formsData.dataFim ? new Date(formsData.dataFim) : new Date());
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
        placeholder="Local do evento"
      />

      {formError ? (
        <AppText style={{ color: "red", marginTop: 10, fontSize: 20 }}>
          {formError}
        </AppText>
      ) : null}

      {/* --- PICKERS --- */}
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
