import React from 'react';
import { render } from '@testing-library/react-native';
// AJUSTE O CAMINHO ABAIXO CONFORME SUA PASTA
import FriendsScreen from '../../../../app/(DashBoard)/(tabs)/Friends';
import { View, Text } from 'react-native';

// --- MOCKS BLINDADOS ---

jest.mock('@/constants/Theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: { background: '#ffffff', text: '#000000' },
    dark: { background: '#000000', text: '#ffffff' },
  },
}));

describe('Screen: Friends', () => {
  it('deve renderizar o texto da tela de amigos', () => {
    const { getByText } = render(<FriendsScreen />);
    
    expect(getByText('TELA DE AMIGOS')).toBeTruthy();
  });

  it('deve renderizar corretamente sem erros', () => {
    const { toJSON } = render(<FriendsScreen />);
    expect(toJSON()).toBeDefined();
  });
});