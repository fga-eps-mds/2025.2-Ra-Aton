import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PostFormComponent } from '../../components/PostFormComponent'; 
import { View, Text } from 'react-native'; 

// --- MOCKS ---

// 1. Mock do InputComp
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

// 2. Mock do DescricaoInput
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

// 3. Mock AppText
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
  
  const initialFormsData = {
    titulo: 'Meu Título',
    descricao: 'Minha Descrição',
  };

  beforeEach(() => {
    mockSetFormData.mockClear();
  });

  it('deve atualizar o título ao digitar (testando a função funcional)', () => {
    const { getByTestId } = render(
      <PostFormComponent 
        formsData={initialFormsData} 
        setFormData={mockSetFormData} 
      />
    );

    fireEvent.changeText(getByTestId('input-titulo'), 'Novo Título');

    expect(mockSetFormData).toHaveBeenCalled();

    // Captura a função (prev) => ...
    const updateFunction = mockSetFormData.mock.calls[0][0];

    // Executa manualmente
    const previousState = { titulo: 'Antigo', descricao: 'Antiga Desc' };
    const newState = updateFunction(previousState);

    expect(newState).toEqual({
      titulo: 'Novo Título',
      descricao: 'Antiga Desc'
    });
  });

  it('deve atualizar a descrição ao digitar (testando a função funcional)', () => {
    const { getByTestId } = render(
      <PostFormComponent 
        formsData={initialFormsData} 
        setFormData={mockSetFormData} 
      />
    );

    fireEvent.changeText(getByTestId('input-descricao'), 'Nova Descrição');

    expect(mockSetFormData).toHaveBeenCalled();

    const updateFunction = mockSetFormData.mock.calls[0][0];
    const previousState = { titulo: 'Titulo Fixo', descricao: 'Antiga' };
    const newState = updateFunction(previousState);

    expect(newState).toEqual({
      titulo: 'Titulo Fixo',
      descricao: 'Nova Descrição'
    });
  });

  it('deve renderizar os valores iniciais e erro', () => {
     const { getByTestId, getByText } = render(
        <PostFormComponent 
          formsData={initialFormsData} 
          setFormData={mockSetFormData}
          formError="Erro teste" 
        />
      );
      expect(getByTestId('input-titulo').props.value).toBe('Meu Título');
      expect(getByText('Erro teste')).toBeTruthy();
  });
});