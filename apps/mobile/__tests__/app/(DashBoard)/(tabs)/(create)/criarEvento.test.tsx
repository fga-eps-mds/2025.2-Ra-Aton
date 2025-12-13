import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
// Ajuste o caminho se necessário (ex: ../../../../../app/(DashBoard)/(tabs)/(create)/criarEvento)
import CriarEvento from '../../../../../app/(DashBoard)/(tabs)/(create)/criarEvento'; 
import { View, Text, TouchableOpacity } from 'react-native';

// --- MOCKS ---

jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: { background: '#fff', text: '#000', orange: 'orange' },
    dark: { background: '#000', text: '#fff', orange: 'orange' },
  },
}));

jest.mock('@/constants/Fonts', () => ({
  Fonts: { otherFonts: { dongleBold: 'Arial' } },
}));

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock do Hook de Lógica
jest.mock('@/libs/hooks/eventoForms', () => ({
  eventoForms: jest.fn(),
}));

import { eventoForms } from '@/libs/hooks/eventoForms';

// Mocks Visuais
jest.mock('@/components/BackGroundComp', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, { testID: "bg-comp" }, props.children);
});

jest.mock('@/components/AppText', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return (props: any) => React.createElement(Text, props, props.children);
});

jest.mock('@/components/SpacerComp', () => 'Spacer');

jest.mock('@/components/PrimaryButton', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => React.createElement(TouchableOpacity, { onPress: props.onPress, disabled: props.disabled, testID: "btn-criar" },
    React.createElement(Text, {}, props.children)
  );
});

jest.mock('@/components/SecondaryButton', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => React.createElement(TouchableOpacity, { onPress: props.onPress, testID: "btn-voltar" },
    React.createElement(Text, {}, props.children)
  );
});

// Mock ListGroups (Simplificado)
jest.mock('@/components/ListGroupsFromAdminUser', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => React.createElement(TouchableOpacity, { onPress: () => props.onSelect('grupo-123'), testID: "list-groups" },
    React.createElement(Text, {}, "Lista de Grupos")
  );
});

// Mock EventoForm (Simplificado)
jest.mock('@/components/EventoFormComponent', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    EventoFormComponent: () => React.createElement(View, { testID: "evento-form" })
  };
});

describe('Screen: CriarEvento', () => {
  const mockHandleSubmit = jest.fn();
  const mockSetFormData = jest.fn();
  const mockComebackPage = jest.fn();
  const mockEventoForms = eventoForms as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEventoForms.mockReturnValue({
      formsData: {},
      isDisabled: false,
      setFormData: mockSetFormData,
      handleSubmit: mockHandleSubmit,
      comebackPage: mockComebackPage,
      formError: null,
    });
  });

  it('deve renderizar o formulário e a lista de grupos', () => {
    const { getByTestId, getByText } = render(<CriarEvento />);
    
    expect(getByText('Selecione o grupo para o evento')).toBeTruthy();
    expect(getByTestId('list-groups')).toBeTruthy();
    expect(getByTestId('evento-form')).toBeTruthy();
  });

  it('deve chamar handleSubmit ao clicar no botão "Criar Evento"', () => {
    const { getByTestId } = render(<CriarEvento />);
    
    fireEvent.press(getByTestId('btn-criar'));
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('deve chamar comebackPage ao clicar em "Voltar"', () => {
    const { getByTestId } = render(<CriarEvento />);
    
    fireEvent.press(getByTestId('btn-voltar'));
    expect(mockComebackPage).toHaveBeenCalled();
  });

  it('deve desabilitar o botão se o hook retornar isDisabled=true', () => {
    mockEventoForms.mockReturnValue({
      isDisabled: true, // <--- TRAVADO
      formsData: {}, setFormData: jest.fn(), handleSubmit: jest.fn(), comebackPage: jest.fn()
    });

    const { getByTestId } = render(<CriarEvento />);
    const btn = getByTestId('btn-criar');
    
    expect(btn.props.accessibilityState?.disabled === true || btn.props.disabled === true).toBeTruthy();
  });
});