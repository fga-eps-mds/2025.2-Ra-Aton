import React from 'react';
import { View } from 'react-native';
import InputComp from '@/components/InputComp';

interface RegisterFormProps {
  formData: {
    name: string;
    email: string;
    userName: string;
    password: string;
    confirmPassword: string;
  };
  errors: {
    name: string;
    email: string;
    nickname: string;
    password: string;
    confirmPassword: string;
    backendEmail: string;
    backendNickname: string;
  };
  setFormData: (data: any) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  formData,
  errors,
  setFormData
}) => {
  return (
    <View style={{ width: '100%' }}>
      <InputComp
        label="Nome completo"
        iconName="person-sharp"
        value={formData.name}
        onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
        status={!!errors.name}
        statusText={errors.name}
      />

      <InputComp
        label="Nome de usuário"
        iconName="pricetag-outline"
        value={formData.userName}
        onChangeText={(text) => setFormData(prev => ({ ...prev, userName: text }))}
        status={!!errors.nickname || !!errors.backendNickname}
        statusText={errors.nickname || errors.backendNickname}
      />

      <InputComp
        label="E-mail"
        iconName="at"
        keyboardType="email-address"
        autoComplete="email"
        autoCapitalize="none"
        value={formData.email}
        onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
        status={!!errors.email || !!errors.backendEmail}
        statusText={errors.email || errors.backendEmail}
      />

      <InputComp
        label="Senha"
        iconName="key"
        secureTextEntry={true}
        textContentType="password"
        autoCapitalize="none"
        value={formData.password}
        onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
        status={!!errors.password}
        statusText={errors.password}
      />

      <InputComp
        label="Confirme sua senha"
        iconName="key"
        secureTextEntry={true}
        textContentType="password"
        autoCapitalize="none"
        value={formData.confirmPassword}
        onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
        status={!!errors.confirmPassword}
        statusText={errors.confirmPassword}
      />
    </View>
  );
};