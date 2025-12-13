import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import GroupProfileScreen from '../../app/perfilGrupo'; // Ajuste o caminho se necessário
import { View, Text, TouchableOpacity } from 'react-native';

// --- MOCKS ---
// Mocks para resolver dependências de estilo/contexto
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

// Mock do SafeAreaView
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  const React = require('react');
  return {
    SafeAreaView: (props: any) => <View {...props}>{props.children}</View>,
  };
});

// Mock do Ionicons
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  const React = require('react');
  return {
    Ionicons: (props: any) => <View testID={`icon-${props.name}`} {...props} />,
  };
});

// Mock do Expo Router (CORRIGIDO PARA INCLUIR 'replace')
const mockBack = jest.fn();
const mockReplace = jest.fn(); // Função que estava faltando
jest.mock('expo-router', () => ({
  // Assume que o componente PerfilGrupo usa um ID da rota
  useLocalSearchParams: () => ({ id: 'Grupo-123' }), 
  useRouter: () => ({ 
    back: mockBack,
    replace: mockReplace, // CORREÇÃO PARA router.replace IS NOT A FUNCTION
  }),
}));

describe('Screen: app/perfilGrupo', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Teste que estava falhando (TypeError: router.replace is not a function)
  it('deve voltar para a tela anterior ao clicar na seta', () => {
    const { getByTestId } = render(<GroupProfileScreen />);
    
    // Simula o clique na seta (assumindo que o componente usa 'arrow-back' e chama replace)
    fireEvent.press(getByTestId('icon-arrow-back')); 
    
    // Verifica se a função 'replace' foi chamada com a rota correta
    expect(mockReplace).toHaveBeenCalledWith("/(DashBoard)/(tabs)/Teams");
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockBack).not.toHaveBeenCalled();
  });
  
  // Testes adicionais para garantir que o arquivo não está vazio
  it('deve renderizar o ID do grupo vindo da rota', () => {
    const { getByText } = render(<GroupProfileScreen />);
    
    expect(getByText('ID: Grupo-123')).toBeTruthy();
  });

  it('deve renderizar o título da tela', () => {
    const { getByText } = render(<GroupProfileScreen />);
    expect(getByText('Perfil do Grupo')).toBeTruthy();
  });
  
  // Aqui você deve restaurar os testes do GroupCard (se pertencerem a esta suite)
  // ...
});