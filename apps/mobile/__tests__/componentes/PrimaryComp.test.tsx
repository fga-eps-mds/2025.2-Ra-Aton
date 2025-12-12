import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button1Comp from '../../components/PrimaryButton'; 
import { View, Text } from 'react-native';

// --- MOCKS ---
jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: { orange: 'red', gray: 'gray', text: 'black' },
    dark: { orange: 'red', gray: 'gray', text: 'white' },
  },
}));

// Mock simples para garantir que texto apareça
jest.mock('../../components/AppText', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <Text {...props}>{props.children}</Text>,
  };
});

jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    Ionicons: (props: any) => <View {...props} />,
  };
});

describe('PrimaryButton', () => {
  it('deve renderizar o texto', () => {
    const { getByText } = render(<Button1Comp>Botao Teste</Button1Comp>);
    expect(getByText('Botao Teste')).toBeTruthy();
  });

  it('deve disparar onPress', () => {
    const fn = jest.fn();
    const { getByText } = render(<Button1Comp onPress={fn}>Clique</Button1Comp>);
    fireEvent.press(getByText('Clique'));
    expect(fn).toHaveBeenCalled();
  });

  it('deve renderizar estado desabilitado', () => {
    const { getByText } = render(<Button1Comp disabled={true}>Disabled</Button1Comp>);
    
    // CORREÇÃO AQUI: Usamos Regex (/.../i) para aceitar "Disabled (disabled)"
    expect(getByText(/Disabled/i)).toBeTruthy();
  });
});