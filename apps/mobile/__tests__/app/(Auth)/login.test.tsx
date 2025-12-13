import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../../../app/(Auth)/login'; 
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

// --- MOCKS BLINDADOS (Usando Alias @/) ---

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

// Mock da Imagem usando Alias
jest.mock('@/assets/img/Logo_1_Atom.png', () => 1);

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock do Hook
jest.mock('@/libs/hooks/useLoginForm', () => ({
  useLoginForm: jest.fn(),
}));

import { useLoginForm } from '@/libs/hooks/useLoginForm';

// Mocks Visuais usando Alias @/
jest.mock('@/components/BackGroundComp', () => {
  const { View } = require('react-native');
  const React = require('react');
  return (props: any) => <View testID="bg-comp">{props.children}</View>;
});

jest.mock('@/components/InputComp', () => {
  const { TextInput } = require('react-native');
  const React = require('react');
  return (props: any) => (
    <TextInput
      testID={`input-${props.label}`}
      value={props.value}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder}
    />
  );
});

jest.mock('@/components/PrimaryButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  const React = require('react');
  return (props: any) => (
    <TouchableOpacity 
      onPress={props.onPress} 
      testID={props.testID || 'btn-primary'}
      disabled={props.disabled}
    >
      <Text>{props.children}</Text>
    </TouchableOpacity>
  );
});

jest.mock('@/components/SecondaryButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  const React = require('react');
  return (props: any) => (
    <TouchableOpacity onPress={props.onPress} testID="btn-cadastro">
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

describe('Screen: Login', () => {
  const mockHandleSubmit = jest.fn();
  const mockSetFormData = jest.fn();
  const mockUseLoginForm = useLoginForm as jest.Mock;

  const defaultHookReturn = {
    formData: { email: '', password: '' },
    setFormData: mockSetFormData,
    isLoading: false,
    error: null,
    isButtonDisabled: false,
    handleSubmit: mockHandleSubmit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLoginForm.mockReturnValue(defaultHookReturn);
  });

  it('deve renderizar os campos de email e senha', () => {
    const { getByTestId } = render(<LoginScreen />);
    
    expect(getByTestId('input-E-mail')).toBeTruthy();
    expect(getByTestId('input-Senha')).toBeTruthy();
  });

  it('deve atualizar o form ao digitar', () => {
    const { getByTestId } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('input-E-mail'), 'teste@email.com');
    expect(mockSetFormData).toHaveBeenCalled();

    fireEvent.changeText(getByTestId('input-Senha'), '123456');
    expect(mockSetFormData).toHaveBeenCalled();
  });

  it('deve chamar handleSubmit ao clicar no botão de Login', () => {
    const { getByTestId } = render(<LoginScreen />);
    
    // O componente usa testID="botaoLogin"
    fireEvent.press(getByTestId('botaoLogin'));
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it('deve navegar para cadastro ao clicar no botão secundário', () => {
    const { getByTestId } = render(<LoginScreen />);
    
    fireEvent.press(getByTestId('btn-cadastro'));
    expect(mockPush).toHaveBeenCalledWith('/cadastro');
  });

  it('deve mostrar Loading quando isLoading for true', () => {
    mockUseLoginForm.mockReturnValue({
      ...defaultHookReturn,
      isLoading: true,
    });

    const { UNSAFE_getByType, queryByTestId } = render(<LoginScreen />);
    
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();

    // Botão some no loading
    expect(queryByTestId('botaoLogin')).toBeNull();
  });

  it('deve mostrar mensagem de erro se houver erro', () => {
    mockUseLoginForm.mockReturnValue({
      ...defaultHookReturn,
      error: 'Credenciais inválidas',
    });

    const { getByText } = render(<LoginScreen />);
    expect(getByText('Credenciais inválidas')).toBeTruthy();
  });

  it('deve desabilitar o botão se isButtonDisabled for true', () => {
    mockUseLoginForm.mockReturnValue({
      ...defaultHookReturn,
      isButtonDisabled: true,
    });

    const { getByTestId } = render(<LoginScreen />);
    const btn = getByTestId('botaoLogin');

    expect(btn.props.accessibilityState?.disabled === true || btn.props.disabled === true).toBeTruthy();
  });
});