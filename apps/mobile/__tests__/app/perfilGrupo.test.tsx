import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GroupProfileScreen from '../../app/perfilGrupo'; 
import { View, Text, TouchableOpacity } from 'react-native';

// --- MOCKS ---

jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: { text: '#000', gray: '#ccc' },
    dark: { text: '#fff', gray: '#333' },
  },
}));

// Mock do BackGroundComp
jest.mock('@/components/BackGroundComp', () => {
  const { View } = require('react-native');
  const React = require('react');
  return (props: any) => <View testID="background-comp">{props.children}</View>;
});

// Mock do SafeAreaView (AQUI ESTAVA O ERRO)
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  const React = require('react');
  return {
    SafeAreaView: (props: any) => <View {...props}>{props.children}</View>,
  };
});

// Mock do Expo Router
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'Grupo-123' }),
  useRouter: () => ({ back: mockBack }),
}));

// Mock do Ionicons
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  const React = require('react');
  return {
    Ionicons: (props: any) => <View testID={`icon-${props.name}`} {...props} />,
  };
});

describe('Screen: app/perfilGrupo', () => {
  it('deve renderizar o ID do grupo vindo da rota', () => {
    const { getByText } = render(<GroupProfileScreen />);
    
    expect(getByText('ID: Grupo-123')).toBeTruthy();
  });

  it('deve renderizar o título da tela', () => {
    const { getByText } = render(<GroupProfileScreen />);
    expect(getByText('Perfil do Grupo')).toBeTruthy();
  });

  it('deve voltar para a tela anterior ao clicar na seta', () => {
    const { getByTestId } = render(<GroupProfileScreen />);
    
    fireEvent.press(getByTestId('icon-arrow-back'));
    
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});