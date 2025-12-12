import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RegisterForm } from '../../components/RegisterForm';
import { View, TextInput } from 'react-native';

// --- MOCKS BLINDADOS ---

// Mock do InputComp: Transforma em TextInput simples para teste lógico
jest.mock('../../components/InputComp', () => {
  const { TextInput } = require('react-native');
  const React = require('react');
  return (props: any) => (
    <TextInput
      testID={`input-${props.label}`} // Gera ID dinâmico: input-E-mail, input-Senha
      value={props.value}
      onChangeText={props.onChangeText}
      placeholder={props.statusText} // Usamos placeholder para verificar se o erro chegou
    />
  );
});

describe('RegisterForm', () => {
  const mockFormData = {
    name: 'João',
    email: 'joao@test.com',
    userName: 'joao123',
    password: '123',
    confirmPassword: '123',
  };

  const mockErrors = {
    name: '',
    email: 'Email inválido', // Erro de teste
    nickname: '',
    password: '',
    confirmPassword: '',
    backendEmail: '',
    backendNickname: '',
  };

  const mockSetFormData = jest.fn();

  it('deve renderizar os valores iniciais nos inputs', () => {
    const { getByTestId } = render(
      <RegisterForm 
        formData={mockFormData} 
        errors={mockErrors} 
        setFormData={mockSetFormData} 
      />
    );

    // Verifica se os valores foram passados para os inputs mockados
    expect(getByTestId('input-Nome completo').props.value).toBe('João');
    expect(getByTestId('input-E-mail').props.value).toBe('joao@test.com');
    expect(getByTestId('input-Nome de usuário').props.value).toBe('joao123');
  });

  it('deve chamar setFormData ao digitar (Ex: Nome)', () => {
    const { getByTestId } = render(
      <RegisterForm 
        formData={mockFormData} 
        errors={mockErrors} 
        setFormData={mockSetFormData} 
      />
    );

    fireEvent.changeText(getByTestId('input-Nome completo'), 'Maria');
    
    // O componente usa setFormData((prev) => ...), então verificamos se a função foi chamada
    expect(mockSetFormData).toHaveBeenCalled();
  });

  it('deve chamar setFormData ao digitar (Ex: Senha)', () => {
    const { getByTestId } = render(
      <RegisterForm 
        formData={mockFormData} 
        errors={mockErrors} 
        setFormData={mockSetFormData} 
      />
    );

    fireEvent.changeText(getByTestId('input-Senha'), '456');
    expect(mockSetFormData).toHaveBeenCalled();
  });

  it('deve repassar mensagens de erro para os inputs', () => {
    // No nosso mock, mapeamos a prop `statusText` (erro) para o `placeholder` do TextInput
    // Isso é um truque comum para verificar props "escondidas" em mocks
    const { getByTestId } = render(
      <RegisterForm 
        formData={mockFormData} 
        errors={mockErrors} // Passamos um erro de email proposital
        setFormData={mockSetFormData} 
      />
    );

    const emailInput = getByTestId('input-E-mail');
    expect(emailInput.props.placeholder).toBe('Email inválido');
  });
});