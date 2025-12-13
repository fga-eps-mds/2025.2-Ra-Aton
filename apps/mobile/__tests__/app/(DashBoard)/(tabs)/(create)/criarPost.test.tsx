import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
// Ajuste do caminho conforme solicitado
import CriarPost from '../../../../../app/(DashBoard)/(tabs)/(create)/criarPost';
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

// Mock do Hook
jest.mock('@/libs/hooks/postForms', () => ({
  postForms: jest.fn(),
}));

import { postForms } from '@/libs/hooks/postForms';

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

// Mock da Lista de Grupos - CRUCIAL para selecionar ID
jest.mock('@/components/ListGroupsFromAdminUser', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => React.createElement(TouchableOpacity, { 
    onPress: () => props.onSelect('grupo-selecionado-123'), 
    testID: "select-group" 
  }, React.createElement(Text, {}, "Selecionar Grupo"));
});

jest.mock('@/components/PostFormComponent', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    PostFormComponent: () => React.createElement(View, { testID: "post-form" })
  };
});

// Mock KeyboardAvoidingView
jest.mock('react-native/Libraries/Components/Keyboard/KeyboardAvoidingView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => React.createElement(View, props, props.children);
});

describe('Screen: CriarPost', () => {
  const mockHandleSubmit = jest.fn();
  const mockSetFormData = jest.fn();
  const mockComebackPage = jest.fn();
  const mockPostForms = postForms as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPostForms.mockReturnValue({
      formsData: {},
      isDisabled: false,
      setFormData: mockSetFormData,
      handleSubmit: mockHandleSubmit,
      comebackPage: mockComebackPage,
      formError: null,
    });
  });

  it('deve renderizar a seleção de grupos e o formulário', () => {
    const { getByTestId, getByText } = render(<CriarPost />);
    
    expect(getByText('Selecione o grupo para o post')).toBeTruthy();
    expect(getByTestId('select-group')).toBeTruthy();
    expect(getByTestId('post-form')).toBeTruthy();
  });

  it('deve atualizar o hook quando um grupo é selecionado', () => {
    const { getByTestId } = render(<CriarPost />);
    
    // Simula clique na seleção de grupo
    fireEvent.press(getByTestId('select-group'));
    
    // O componente dispara um state update (setSelectedGroupId).
    // O hook postForms é chamado novamente com esse novo ID.
    // Verificamos se o hook foi chamado com o ID que definimos no mock ('grupo-selecionado-123')
    // Nota: A primeira chamada é com null. A segunda (após o clique) deve ser com o ID.
    
    expect(mockPostForms).toHaveBeenCalledWith('grupo-selecionado-123');
  });

  it('deve chamar handleSubmit ao clicar em "Criar Post"', () => {
    const { getByTestId } = render(<CriarPost />);
    fireEvent.press(getByTestId('btn-criar'));
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it('deve chamar comebackPage ao clicar em "Voltar"', () => {
    const { getByTestId } = render(<CriarPost />);
    fireEvent.press(getByTestId('btn-voltar'));
    expect(mockComebackPage).toHaveBeenCalledTimes(1);
  });
});