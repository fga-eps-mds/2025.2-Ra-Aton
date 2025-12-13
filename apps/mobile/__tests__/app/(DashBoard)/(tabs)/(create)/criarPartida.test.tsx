import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
// Ajuste do caminho com mais um nível conforme solicitado
import CriarPartida from '../../../../../app/(DashBoard)/(tabs)/(create)/criarPartida';
import { View, Text, TouchableOpacity } from 'react-native';

// --- MOCKS BLINDADOS ---

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

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock do Hook de Lógica
jest.mock('@/libs/hooks/partidaForms', () => ({
  partidaForms: jest.fn(),
}));

import { partidaForms } from '@/libs/hooks/partidaForms';

// --- MOCKS VISUAIS ---

jest.mock('@/components/BackGroundComp', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, { testID: "bg-comp" }, props.children);
});

jest.mock('@/components/SpacerComp', () => 'Spacer');

jest.mock('@/components/AppText', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return (props: any) => React.createElement(Text, props, props.children);
});

jest.mock('@/components/PrimaryButton', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => React.createElement(TouchableOpacity, { 
    onPress: props.onPress, 
    disabled: props.disabled,
    testID: "btn-criar" 
  }, React.createElement(Text, {}, props.children));
});

jest.mock('@/components/SecondaryButton', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => React.createElement(TouchableOpacity, { 
    onPress: props.onPress, 
    testID: "btn-voltar" 
  }, React.createElement(Text, {}, props.children));
});

// Mock do Formulário Específico
jest.mock('@/components/PartidaFormComponent', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    PartidaFormComponent: () => React.createElement(View, { testID: "partida-form" })
  };
});

// Mock para KeyboardAvoidingView (Nativo) para evitar erros de renderização
jest.mock('react-native/Libraries/Components/Keyboard/KeyboardAvoidingView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, props, props.children);
});

describe('Screen: CriarPartida', () => {
  const mockHandleSubmit = jest.fn();
  const mockSetFormData = jest.fn();
  const mockComebackPage = jest.fn();
  const mockPartidaForms = partidaForms as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPartidaForms.mockReturnValue({
      formsData: {},
      isDisabled: false,
      setFormData: mockSetFormData,
      handleSubmit: mockHandleSubmit,
      comebackPage: mockComebackPage,
      formError: null,
    });
  });

  it('deve renderizar o formulário de partida', () => {
    const { getByTestId } = render(<CriarPartida />);
    expect(getByTestId('partida-form')).toBeTruthy();
  });

  it('deve chamar handleSubmit ao clicar em "Criar Partida"', () => {
    const { getByTestId } = render(<CriarPartida />);
    
    fireEvent.press(getByTestId('btn-criar'));
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it('deve chamar comebackPage ao clicar em "Voltar"', () => {
    const { getByTestId } = render(<CriarPartida />);
    
    fireEvent.press(getByTestId('btn-voltar'));
    expect(mockComebackPage).toHaveBeenCalledTimes(1);
  });

  it('deve desabilitar o botão se o hook retornar isDisabled=true', () => {
    mockPartidaForms.mockReturnValue({
      isDisabled: true, // <--- Estado travado
      formsData: {}, setFormData: jest.fn(), handleSubmit: jest.fn(), comebackPage: jest.fn()
    });

    const { getByTestId } = render(<CriarPartida />);
    const btn = getByTestId('btn-criar');
    
    // Verifica a prop disabled no TouchableOpacity mockado
    expect(btn.props.disabled).toBe(true);
  });
});