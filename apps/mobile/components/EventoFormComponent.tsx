import React from 'react';
import { View } from 'react-native';
import InputComp from '@/components/InputComp';
import { DescricaoInput } from '@/components/DescricaoInput';

interface EventFormProps {
  formsData: {
    titulo: string;
    descricao: string;
    dataInicio: string;
    dataFim: string;
    local: string;
  };
  setFormData: (data: any) => void;
}

export const EventoFormComponent: React.FC<EventFormProps> = ({
  formsData,
  setFormData,
}) => {
  return (
    <View style={{ width: '100%' }}>
      <InputComp
        label="Título *"
        iconName="document"
        value={formsData.titulo}
        onChangeText={(text) => setFormData(prev => ({ ...prev, titulo: text }))}
        placeholder="Título do evento"
      />

      <DescricaoInput
        label="Descrição"
        value={formsData.descricao}
        onChangeText={(text) => setFormData(prev => ({ ...prev, descricao: text }))}
        placeholder="Descreva o evento aqui..."
        height={120}
      />

      <InputComp
        label="Data Início *"
        iconName="calendar"
        value={formsData.dataInicio}
        onChangeText={(text) => setFormData(prev => ({ ...prev, dataInicio: text }))}
        placeholder="31/12/2025 22:00"
      />

      <InputComp
        label="Data Fim"
        iconName="calendar"
        value={formsData.dataFim}
        onChangeText={(text) => setFormData(prev => ({ ...prev, dataFim: text }))}
        placeholder="01/01/2026 02:00"
      />

      <InputComp
        label="Local *"
        iconName="location"
        value={formsData.local}
        onChangeText={(text) => setFormData(prev => ({ ...prev, local: text }))}
        placeholder="Local do evento"
      />
    </View>
  );
};
