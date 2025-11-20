import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EventoFormComponent } from '@/components/EventoFormComponent';

// --- MOCKS ---

// 1. Mock do InputComp (Assumindo que é export default)
jest.mock('@/components/InputComp', () => {
  const { TextInput } = require('react-native');
  // Para 'export default', retornamos a função diretamente
  return jest.fn(({ value, onChangeText, placeholder, label }) => (
    <TextInput
      testID={`input-${label}`}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
    />
  ));
});

// 2. Mock do DescricaoInput
jest.mock('@/components/DescricaoInput', () => {
  const { TextInput } = require('react-native');
  
  // IMPORTANTE: Retornamos um OBJETO contendo a chave 'DescricaoInput'
  return {
    DescricaoInput: jest.fn(({ value, onChangeText, placeholder, label }) => (
      <TextInput
        testID={`input-${label}`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
      />
    )),
  };
});

describe('EventoFormComponent', () => {
  const mockFormData = {
    titulo: 'Festa de Teste',
    descricao: 'Descrição inicial',
    dataInicio: '25/12/2025 20:00',
    dataFim: '26/12/2025 02:00',
    local: 'Campus 1',
  };

  const mockSetFormData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar todos os campos com os valores iniciais corretos', () => {
    const { getByDisplayValue } = render(
      <EventoFormComponent 
        formsData={mockFormData} 
        setFormData={mockSetFormData} 
      />
    );

    expect(getByDisplayValue('Festa de Teste')).toBeTruthy();
    expect(getByDisplayValue('Descrição inicial')).toBeTruthy();
    expect(getByDisplayValue('25/12/2025 20:00')).toBeTruthy();
    expect(getByDisplayValue('26/12/2025 02:00')).toBeTruthy();
    expect(getByDisplayValue('Campus 1')).toBeTruthy();
  });

  it('deve chamar setFormData corretamente ao alterar o Título', () => {
    const { getByPlaceholderText } = render(
      <EventoFormComponent formsData={mockFormData} setFormData={mockSetFormData} />
    );

    const inputTitulo = getByPlaceholderText('Título do evento');
    fireEvent.changeText(inputTitulo, 'Novo Título');

    expect(mockSetFormData).toHaveBeenCalledTimes(1);
    
    const functionPassedToSetState = mockSetFormData.mock.calls[0][0];
    const newState = functionPassedToSetState(mockFormData);
    
    expect(newState).toEqual({
      ...mockFormData,
      titulo: 'Novo Título',
    });
  });

  it('deve chamar setFormData corretamente ao alterar a Descrição', () => {
    const { getByPlaceholderText } = render(
      <EventoFormComponent formsData={mockFormData} setFormData={mockSetFormData} />
    );

    const inputDescricao = getByPlaceholderText('Descreva o evento aqui...');
    fireEvent.changeText(inputDescricao, 'Nova Descrição Detalhada');

    const updateFunction = mockSetFormData.mock.calls[0][0];
    const newState = updateFunction(mockFormData);

    expect(newState).toEqual({
      ...mockFormData,
      descricao: 'Nova Descrição Detalhada',
    });
  });

  it('deve chamar setFormData ao alterar Data Início', () => {
    const { getByPlaceholderText } = render(
      <EventoFormComponent formsData={mockFormData} setFormData={mockSetFormData} />
    );

    const inputDate = getByPlaceholderText('31/12/2025 22:00');
    fireEvent.changeText(inputDate, '01/01/2026 00:00');

    const updateFunction = mockSetFormData.mock.calls[0][0];
    expect(updateFunction(mockFormData).dataInicio).toBe('01/01/2026 00:00');
  });

  it('deve chamar setFormData ao alterar Local', () => {
    const { getByPlaceholderText } = render(
      <EventoFormComponent formsData={mockFormData} setFormData={mockSetFormData} />
    );

    const inputLocal = getByPlaceholderText('Local do evento');
    fireEvent.changeText(inputLocal, 'Auditório Principal');

    const updateFunction = mockSetFormData.mock.calls[0][0];
    expect(updateFunction(mockFormData).local).toBe('Auditório Principal');
  });
});