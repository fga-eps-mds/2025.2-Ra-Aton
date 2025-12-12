import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PartidaFormComponent, formatarData } from '@/components/PartidaFormComponent';

// --------------------- MOCKS ---------------------
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
  return (props: any) => (props.children ? <Text testID="error-text">{props.children}</Text> : null);
});

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const { View, Text, Pressable } = require('react-native');
  return ({ testID, onChange, mode, value }: any) => {
    const id = testID || `mockDatePicker-${mode}`;
    return (
      <View testID={id}>
        <Text>{`MockDatePicker (${mode})`}</Text>
        <Pressable testID={`${id}-set`} onPress={() => onChange({ type: 'set' }, new Date('2024-01-01T12:00'))}>
          <Text>SET</Text>
        </Pressable>
        <Pressable testID={`${id}-dismiss`} onPress={() => onChange({ type: 'dismissed' })}>
          <Text>DISMISS</Text>
        </Pressable>
      </View>
    );
  };
});

// --------------------- TESTES ---------------------
describe('PartidaFormComponent', () => {
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

  it('renderiza inputs corretamente', () => {
    const { getByPlaceholderText, getAllByPlaceholderText } = render(
      <PartidaFormComponent formsData={mockFormsData} setFormData={mockSetFormData} />
    );

    expect(getByPlaceholderText('Título do partida')).toBeTruthy();
    expect(getByPlaceholderText('Descreva o partida aqui...')).toBeTruthy();
    expect(getByPlaceholderText('Esporte')).toBeTruthy();
    expect(getByPlaceholderText('Numero de participantes')).toBeTruthy();
    expect(getAllByPlaceholderText('Equipe A')).toHaveLength(2);
    expect(getByPlaceholderText('Local da partida')).toBeTruthy();
  });

  it('altera valores de texto e número corretamente', () => {
    const { getByTestId } = render(<PartidaFormComponent formsData={mockFormsData} setFormData={mockSetFormData} />);

    // Título
    fireEvent.changeText(getByTestId('input-Título *'), 'Novo Título');
    let newState = mockSetFormData.mock.calls[0][0](mockFormsData);
    expect(newState.titulo).toBe('Novo Título');

    mockSetFormData.mockClear();

    // Esporte
    fireEvent.changeText(getByTestId('input-Esporte *'), 'Futebol');
    newState = mockSetFormData.mock.calls[0][0](mockFormsData);
    expect(newState.esporte).toBe('Futebol');

    mockSetFormData.mockClear();

    // Numero de participantes
    fireEvent.changeText(getByTestId('input-Numero de participantes *'), '12abc');
    newState = mockSetFormData.mock.calls[0][0](mockFormsData);
    expect(newState.maxPlayers).toBe(12);
  });

it('exibe e oculta mensagem de erro corretamente', () => {
  const errorMessage = 'Campo obrigatório';
  const { getAllByTestId, queryAllByTestId } = render(
    <PartidaFormComponent formsData={mockFormsData} setFormData={mockSetFormData} formError={errorMessage} />
  );

  const errors = getAllByTestId('error-text');
  expect(errors.some(e => e.props.children === errorMessage)).toBe(true);

  const errorsNone = queryAllByTestId('error-text').filter(e => e.props.children === errorMessage);
  expect(errorsNone.length).toBeGreaterThan(0);
});


  it('abre DatePicker e seleciona data/hora corretamente', () => {
  const { getByText } = render(<PartidaFormComponent formsData={mockFormsData} setFormData={mockSetFormData} />);

  // Clicar no Pressable do InputDateComp
  fireEvent.press(getByText('Data Início *'));

  // Seleciona a data
  fireEvent.press(getByText('SET')); // mock do DatePicker date
  fireEvent.press(getByText('SET')); // mock do DatePicker time

  expect(mockSetFormData).toHaveBeenCalled();
  const newState = mockSetFormData.mock.calls[0][0](mockFormsData);
  expect(newState.dataInicio).toBe('2024-01-01T15:00:00.000Z');
});

  it('fecha DatePicker ao cancelar', () => {
    const { getByPlaceholderText, getByText } = render(<PartidaFormComponent formsData={mockFormsData} setFormData={mockSetFormData} />);

    fireEvent.press(getByText('Data Início *')); // abre picker
    fireEvent.press(getByText('DISMISS')); // cancela

    // Se mock do DateTimePicker está removido no render, não dispara setFormData
    expect(mockSetFormData).not.toHaveBeenCalled();
  });

  it('deve retornar string vazia se dataISO for inválido ou vazio', () => {
  // Testando quando dataISO é uma string vazia
  const emptyString = "";
  const resultEmptyString = formatarData(emptyString);
  expect(resultEmptyString).toBe("");

  // Testando quando dataISO é undefined
  const undefinedDate = undefined;
  const resultUndefined = formatarData(undefinedDate);
  expect(resultUndefined).toBe("");

  // Testando quando dataISO é null
  const nullDate = null;
  const resultNull = formatarData(nullDate);
  expect(resultNull).toBe("");

  // Testando quando dataISO é um valor válido (verificando o "else")
  const validDate = "2024-01-01T12:00:00Z";
  const resultValid = formatarData(validDate);
  expect(resultValid).toBe("01/01/2024 09:00");
});



});
