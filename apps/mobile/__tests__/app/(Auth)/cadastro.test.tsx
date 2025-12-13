import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Cadastro from '../../../app/(Auth)/cadastro'; 
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

jest.mock('@/assets/img/Logo_1_Atom.png', () => 1);

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// MOCK DO HOOK (CORRIGIDO PARA SER UM JEST.FN)
jest.mock('@/libs/hooks/useRegisterForm', () => ({
  useRegisterForm: jest.fn(),
}));

// Importamos para controlar
import { useRegisterForm } from '@/libs/hooks/useRegisterForm';

// Mocks Visuais
jest.mock('@/components/BackGroundComp', () => {
  const { View } = require('react-native');
  const React = require('react');
  return (props: any) => <View testID="bg-comp">{props.children}</View>;
});

jest.mock('@/components/RegisterForm', () => {
  const { View } = require('react-native');
  const React = require('react');
  return {
    RegisterForm: () => <View testID="mock-register-form" />,
  };
});

jest.mock('@/components/PrimaryButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  const React = require('react');
  return (props: any) => (
    <TouchableOpacity onPress={props.onPress} disabled={props.disabled} testID="btn-criar">
      <Text>{props.children}</Text>
    </TouchableOpacity>
  );
});

jest.mock('@/components/SecondaryButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  const React = require('react');
  return (props: any) => (
    <TouchableOpacity onPress={props.onPress} testID="btn-login">
      <Text>{props.children}</Text>
    </TouchableOpacity>
  );
});

jest.mock('@/components/AppText', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: (props: any) => <Text {...props}>{props.children}</Text>,
  };
});

describe('Screen: Cadastro', () => {
  const mockHandleSubmit = jest.fn();
  const mockSetFormData = jest.fn();
  const mockUseRegisterForm = useRegisterForm as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Retorno Padrão
    mockUseRegisterForm.mockReturnValue({
      formData: { name: '', email: '' },
      errors: {},
      isDisabled: false,
      setFormData: mockSetFormData,
      handleSubmit: mockHandleSubmit,
    });
  });

  it('deve renderizar o formulário de cadastro', () => {
    const { getByTestId } = render(<Cadastro />);
    expect(getByTestId('mock-register-form')).toBeTruthy();
  });

  it('deve chamar handleSubmit ao clicar em "Criar conta"', () => {
    const { getByTestId } = render(<Cadastro />);
    
    fireEvent.press(getByTestId('btn-criar'));
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it('deve navegar para login ao clicar no botão secundário', () => {
    const { getByTestId } = render(<Cadastro />);
    
    fireEvent.press(getByTestId('btn-login'));
    expect(mockPush).toHaveBeenCalledWith('/(Auth)/login');
  });

  it('não deve permitir clique se o hook retornar isDisabled=true', () => {
    // AGORA FUNCIONA: O mockImplementationOnce existe porque o mock original é jest.fn()
    mockUseRegisterForm.mockImplementationOnce(() => ({
      formData: {}, 
      errors: {}, 
      isDisabled: true, // <--- TRAVADO
      setFormData: jest.fn(), 
      handleSubmit: mockHandleSubmit
    }));

    const { getByTestId } = render(<Cadastro />);
    const btn = getByTestId('btn-criar');
    
    expect(btn.props.accessibilityState?.disabled === true || btn.props.disabled === true).toBeTruthy();
  });
});