import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SolicitacoesComp } from '../../components/SolicitacoesComp'; // Ajuste o path se necessário
import { View, Text, TouchableOpacity } from 'react-native';

// --- MOCKS BLINDADOS ---

jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: { input: '#fff', background: '#000', text: '#000' },
    dark: { input: '#333', background: '#fff', text: '#fff' },
  },
}));

// Mock do AppText
jest.mock('../../components/AppText', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <Text {...props}>{props.children}</Text>,
  };
});

// Mock do PrimaryButton
jest.mock('../../components/PrimaryButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => (
    <TouchableOpacity onPress={props.onPress} testID={`btn-primary-${props.children}`}>
      <Text>{props.children}</Text>
    </TouchableOpacity>
  );
});

// Mock do SecondaryButton
jest.mock('../../components/SecondaryButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => (
    <TouchableOpacity onPress={props.onPress} testID={`btn-secondary-${props.children}`}>
      <Text>{props.children}</Text>
    </TouchableOpacity>
  );
});

describe('SolicitacoesComp', () => {
  const mockOnPrimary = jest.fn();
  const mockOnSecondary = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o nome da solicitação', () => {
    const { getByText } = render(<SolicitacoesComp name="Convite Grupo A" />);
    expect(getByText('Convite Grupo A')).toBeTruthy();
  });

  it('deve mostrar "Aceitar" e "Rejeitar" quando autor é GROUP', () => {
    const { getByText } = render(
      <SolicitacoesComp 
        name="Teste" 
        autor="GROUP" 
        onPrimaryPress={mockOnPrimary}
        onSecondaryPress={mockOnSecondary}
      />
    );

    // O código usa PrimaryButton para Aceitar e PrimaryButton para Rejeitar (baseado na lógica do componente)
    // O teste verifica se os textos estão lá
    expect(getByText('Aceitar')).toBeTruthy();
    expect(getByText('Rejeitar')).toBeTruthy();

    fireEvent.press(getByText('Aceitar'));
    expect(mockOnPrimary).toHaveBeenCalled();

    fireEvent.press(getByText('Rejeitar'));
    expect(mockOnSecondary).toHaveBeenCalled();
  });

  it('deve mostrar "Cancelar" quando status é PENDING (e não é GROUP)', () => {
    const { getByText, queryByText } = render(
      <SolicitacoesComp 
        name="Teste" 
        status="PENDING" 
        onPrimaryPress={mockOnPrimary}
      />
    );

    expect(getByText('Cancelar')).toBeTruthy();
    expect(queryByText('Rejeitar')).toBeNull(); // Não deve ter segundo botão

    fireEvent.press(getByText('Cancelar'));
    expect(mockOnPrimary).toHaveBeenCalled();
  });

  it('deve mostrar "Aceito" (botão secundário/disabled visualmente) quando status é APPROVED', () => {
    const { getByText } = render(
      <SolicitacoesComp name="Teste" status="APPROVED" />
    );
    expect(getByText('Aceito')).toBeTruthy();
  });

  it('deve mostrar "Rejeitado" quando status é REJECTED', () => {
    const { getByText } = render(
      <SolicitacoesComp name="Teste" status="REJECTED" />
    );
    expect(getByText('Rejeitado')).toBeTruthy();
  });
});