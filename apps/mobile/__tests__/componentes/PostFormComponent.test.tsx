import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PostFormComponent } from '../../components/PostFormComponent'; // Ajuste se for export default
import { View, Text, TextInput } from 'react-native';

// --- MOCKS ---

// Mock do InputComp como TextInput simples
jest.mock('../../components/InputComp', () => {
  const { TextInput } = require('react-native');
  const React = require('react');
  return (props: any) => (
    <TextInput
      testID="input-titulo"
      value={props.value}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder}
    />
  );
});

// Mock do DescricaoInput
jest.mock('../../components/DescricaoInput', () => {
  const { TextInput } = require('react-native');
  const React = require('react');
  return {
    DescricaoInput: (props: any) => (
      <TextInput
        testID="input-descricao"
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
      />
    ),
  };
});

// Mock AppText
jest.mock('../../components/AppText', () => {
  const { Text } = require('react-native');
  const React = require('react');
  return {
    __esModule: true,
    default: (props: any) => <Text {...props}>{props.children}</Text>,
  };
});

describe('PostFormComponent', () => {
  const mockSetFormData = jest.fn();
  const formsData = {
    titulo: 'Meu Título',
    descricao: 'Minha Descrição',
  };

  it('deve renderizar os valores iniciais nos inputs', () => {
    const { getByTestId } = render(
      <PostFormComponent 
        formsData={formsData} 
        setFormData={mockSetFormData} 
      />
    );

    const inputTitulo = getByTestId('input-titulo');
    const inputDesc = getByTestId('input-descricao');

    expect(inputTitulo.props.value).toBe('Meu Título');
    expect(inputDesc.props.value).toBe('Minha Descrição');
  });

  it('deve atualizar o título ao digitar', () => {
    const { getByTestId } = render(
      <PostFormComponent 
        formsData={formsData} 
        setFormData={mockSetFormData} 
      />
    );

    fireEvent.changeText(getByTestId('input-titulo'), 'Novo Título');

    // O componente usa setFormData((prev) => ...).
    // O mockSetFormData recebe a função de update.
    // Verificamos se foi chamado.
    expect(mockSetFormData).toHaveBeenCalled();
  });

  it('deve atualizar a descrição ao digitar', () => {
    const { getByTestId } = render(
      <PostFormComponent 
        formsData={formsData} 
        setFormData={mockSetFormData} 
      />
    );

    fireEvent.changeText(getByTestId('input-descricao'), 'Nova Descrição');
    expect(mockSetFormData).toHaveBeenCalled();
  });

  it('deve exibir mensagem de erro se formError for passado', () => {
    const { getByText } = render(
      <PostFormComponent 
        formsData={formsData} 
        setFormData={mockSetFormData}
        formError="Campo obrigatório"
      />
    );

    expect(getByText('Campo obrigatório')).toBeTruthy();
  });
});