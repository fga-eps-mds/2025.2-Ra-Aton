import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PartidaFormComponent } from '@/components/PartidaFormComponent';

// 1. Mock dos componentes filhos para isolar o teste

jest.mock('@/components/InputComp', () => {
  const { TextInput } = require('react-native');
  return (props: any) => (
    <TextInput
      testID={`input-${props.label}`}
      placeholder={props.placeholder}
      value={props.value}
      onChangeText={props.onChangeText}
      keyboardType={props.keyboardType}
    />
  );
});

jest.mock('@/components/DescricaoInput', () => {
  const { TextInput } = require('react-native');
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

jest.mock('@/components/AppText', () => {
  const { Text } = require('react-native');
  return (props: any) => <Text testID="error-text">{props.children}</Text>;
});

describe('PartidaFormComponent', () => {
  // Dados iniciais para o teste
  const mockFormsData = {
    titulo: '',
    descricao: '',
    esporte: '',
    maxPlayers: 0,
    nomeEquipeA: '',
    nomeEquipeB: '',
    dataInicio: '',
    local: '',
  };

  const mockSetFormData = jest.fn();

  beforeEach(() => {
    mockSetFormData.mockClear();
  });

  it('deve renderizar todos os campos corretamente com os valores iniciais', () => {
    const { getByPlaceholderText, getAllByPlaceholderText } = render(
      <PartidaFormComponent
        formsData={{ ...mockFormsData, titulo: 'Jogo Teste' }}
        setFormData={mockSetFormData}
      />
    );

    // Verifica se os placeholders ou valores estão na tela
    expect(getByPlaceholderText('Título do partida').props.value).toBe('Jogo Teste');
    expect(getByPlaceholderText('Descreva o partida aqui...')).toBeTruthy();
    expect(getByPlaceholderText('Esporte')).toBeTruthy();
    expect(getByPlaceholderText('Numero de participantes')).toBeTruthy();
    
    expect(getAllByPlaceholderText('Equipe A')).toHaveLength(2);
    
    expect(getByPlaceholderText('31/12/2025 22:00')).toBeTruthy();
    expect(getByPlaceholderText('Local da partida')).toBeTruthy();
  });

  it('deve chamar setFormData corretamente ao alterar o Título', () => {
    const { getByTestId } = render(
      <PartidaFormComponent
        formsData={mockFormsData}
        setFormData={mockSetFormData}
      />
    );

    const input = getByTestId('input-Título *');
    fireEvent.changeText(input, 'Novo Título');

    expect(mockSetFormData).toHaveBeenCalledTimes(1);
    
    const updateFunction = mockSetFormData.mock.calls[0][0];
    const newState = updateFunction(mockFormsData);
    expect(newState.titulo).toBe('Novo Título');
  });

  it('deve atualizar o campo Esporte corretamente', () => {
    const { getByTestId } = render(
      <PartidaFormComponent
        formsData={mockFormsData}
        setFormData={mockSetFormData}
      />
    );

    const input = getByTestId('input-Esporte *');
    fireEvent.changeText(input, 'Futebol');

    const updateFunction = mockSetFormData.mock.calls[0][0];
    const newState = updateFunction(mockFormsData);
    expect(newState.esporte).toBe('Futebol');
  });

  it('deve limpar caracteres não numéricos e salvar como Number no campo Numero de participantes', () => {
    const { getByTestId } = render(
      <PartidaFormComponent
        formsData={mockFormsData}
        setFormData={mockSetFormData}
      />
    );

    const input = getByTestId('input-Numero de participantes *');
    
    // Simulando entrada de texto suja (letras + números)
    fireEvent.changeText(input, '12abc');

    const updateFunction = mockSetFormData.mock.calls[0][0];
    const newState = updateFunction(mockFormsData);
    
    expect(newState.maxPlayers).toBe(12);
    expect(typeof newState.maxPlayers).toBe('number');
  });

  it('deve exibir a mensagem de erro quando formError for fornecido', () => {
    const errorMessage = 'Campo obrigatório faltando';
    const { getByText, getByTestId } = render(
      <PartidaFormComponent
        formsData={mockFormsData}
        setFormData={mockSetFormData}
        formError={errorMessage}
      />
    );

    expect(getByText(errorMessage)).toBeTruthy();
    expect(getByTestId('error-text')).toBeTruthy();
  });

  it('não deve exibir mensagem de erro se formError for undefined', () => {
    const { queryByTestId } = render(
      <PartidaFormComponent
        formsData={mockFormsData}
        setFormData={mockSetFormData}
        formError={undefined}
      />
    );

    expect(queryByTestId('error-text')).toBeNull();
  });
});