import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CriarGrupoScreen from '../../../../../app/(DashBoard)/(tabs)/(create)/criarGrupo';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';

// --- MOCKS BLINDADOS ---

jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: { background: '#fff', text: '#000', orange: 'orange', input: '#eee' },
    dark: { background: '#000', text: '#fff', orange: 'orange', input: '#333' },
  },
}));

// Mock do Expo Router
const mockBack = jest.fn();
jest.mock('expo-router', () => {
  const { View } = require('react-native');
  const React = require('react');
  return {
    useRouter: () => ({ back: mockBack, push: jest.fn() }),
    Redirect: (props: any) => <View testID="redirect-component" href={props.href} />,
  };
});

// Mock do Hook
jest.mock('@/libs/hooks/useCreateGroupForm', () => ({
  useCreateGroupForm: jest.fn(),
}));

import { useCreateGroupForm } from '@/libs/hooks/useCreateGroupForm';

// Mocks Visuais
jest.mock('@/components/BackGroundComp', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, { testID: "bg-comp" }, props.children);
});

jest.mock('@/components/PrimaryButton', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => React.createElement(TouchableOpacity, { onPress: props.onPress, testID: "btn-submit" },
    React.createElement(Text, {}, props.children)
  );
});

jest.mock('@/components/InputComp', () => {
  const React = require('react');
  const { TextInput } = require('react-native');
  return (props: any) => React.createElement(TextInput, { 
    // Usamos o placeholder como parte do testID para facilitar a busca
    testID: props.placeholder ? `input-${props.placeholder}` : 'input-comp',
    value: props.value,
    onChangeText: props.onChangeText 
  });
});

jest.mock('react-hook-form', () => ({
  Controller: ({ render, name }: any) => {
    return render({
      field: {
        onChange: jest.fn(),
        onBlur: jest.fn(),
        value: '',
        name: name
      }
    });
  },
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Ionicons: (props: any) => React.createElement(View, { testID: `icon-${props.name}` })
  };
});

describe('Screen: CriarGrupo', () => {
  const mockSubmitForm = jest.fn();
  const mockSetValue = jest.fn();
  const mockUseCreateGroupForm = useCreateGroupForm as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCreateGroupForm.mockReturnValue({
      control: {},
      errors: {},
      selectedType: 'AMATEUR', 
      setValue: mockSetValue,
      submitForm: mockSubmitForm,
      isLoading: false,
      createdGroupId: null
    });
  });

  it('deve renderizar o formulário', () => {
    const { getByText, getByTestId } = render(<CriarGrupoScreen />);
    
    expect(getByText('Criar Novo Grupo')).toBeTruthy();
    // Buscamos pelo testID gerado no mock
    expect(getByTestId('input-Ex: Atlética de Computação')).toBeTruthy();
  });

  it('deve chamar submitForm ao clicar em "Criar Grupo"', () => {
    const { getByTestId } = render(<CriarGrupoScreen />);
    fireEvent.press(getByTestId('btn-submit'));
    expect(mockSubmitForm).toHaveBeenCalled();
  });

  it('deve mostrar loading quando isLoading for true', () => {
    mockUseCreateGroupForm.mockReturnValue({
      isLoading: true, 
      control: {}, errors: {}, selectedType: 'AMATEUR', setValue: jest.fn(), submitForm: jest.fn(), createdGroupId: null
    });

    const { UNSAFE_getByType } = render(<CriarGrupoScreen />);
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('deve redirecionar se um grupo for criado', () => {
    mockUseCreateGroupForm.mockReturnValue({
      createdGroupId: 'new-group-123',
      control: {}, errors: {}, selectedType: 'AMATEUR', setValue: jest.fn(), submitForm: jest.fn(), isLoading: false
    });

    const { getByTestId } = render(<CriarGrupoScreen />);
    const redirect = getByTestId('redirect-component');
    expect(redirect.props.href).toBe('/group/new-group-123');
  });

  it('deve chamar setValue ao trocar o tipo de grupo', () => {
    const { getByText } = render(<CriarGrupoScreen />);
    fireEvent.press(getByText('Atlética'));
    expect(mockSetValue).toHaveBeenCalledWith('type', 'ATHLETIC');
  });
});